import hashlib
import hmac
import os
import time
from threading import Lock

_ITERATIONS = 200_000
_ALGO = "sha256"

DEMO_OPERATOR_PASSWORD = "chaintrace-demo-2026"


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac(_ALGO, password.encode("utf-8"), salt, _ITERATIONS)
    return f"{salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_hex, digest_hex = stored_hash.split("$", 1)
    except ValueError:
        return False
    salt = bytes.fromhex(salt_hex)
    candidate = hashlib.pbkdf2_hmac(_ALGO, password.encode("utf-8"), salt, _ITERATIONS)
    return hmac.compare_digest(candidate.hex(), digest_hex)


# Device nonce tracking for /auth/verify. A nonce may only be redeemed once
# per device within the TTL window, which is what actually stops a captured
# verify payload from being replayed (accepting any nonce, as before, did not).
_NONCE_TTL_SECONDS = 300
_seen_nonces: dict[str, float] = {}
_nonce_lock = Lock()


def check_and_consume_nonce(device_id: str, nonce: str) -> bool:
    key = f"{device_id}:{nonce}"
    now = time.time()
    with _nonce_lock:
        expired = [k for k, ts in _seen_nonces.items() if now - ts > _NONCE_TTL_SECONDS]
        for k in expired:
            del _seen_nonces[k]
        if key in _seen_nonces:
            return False
        _seen_nonces[key] = now
        return True
