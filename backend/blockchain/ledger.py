import hashlib
import json
import os
import time
from pathlib import Path
from threading import Lock

DEFAULT_LEDGER_PATH = Path(__file__).resolve().parent.parent / "ledger_data.json"
LEDGER_PATH = Path(os.environ.get("CHAINTRACE_LEDGER_PATH", DEFAULT_LEDGER_PATH))


class LocalAuditLedger:
    """
    Minimal tamper-evident blockchain-style ledger for the hackathon MVP.
    Each block commits to the previous block hash. Persisted to a JSON file
    so the chain (and the tx_hash/block_number values other tables reference)
    survives a process restart.
    """

    def __init__(self, path: Path = LEDGER_PATH):
        self.path = path
        self.blocks = []
        self.lock = Lock()
        if not self._load():
            self._append_genesis()
            self._save()

    def _load(self) -> bool:
        if not self.path.exists():
            return False
        try:
            with self.path.open("r") as f:
                blocks = json.load(f)
        except (json.JSONDecodeError, OSError):
            return False
        if not blocks:
            return False
        self.blocks = blocks
        return True

    def _save(self):
        tmp = self.path.with_suffix(".tmp")
        with tmp.open("w") as f:
            json.dump(self.blocks, f)
        os.replace(tmp, self.path)

    def _append_genesis(self):
        payload = {"index": 0, "timestamp": 0, "data": "CHAINTRACE_GENESIS", "previous_hash": "0"}
        payload["hash"] = self._hash(payload)
        self.blocks.append(payload)

    def _hash(self, block):
        raw = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(raw).hexdigest()

    def append(self, data):
        with self.lock:
            index = len(self.blocks)
            block = {
                "index": index,
                "timestamp": time.time(),
                "data": data,
                "previous_hash": self.blocks[-1]["hash"],
            }
            block["hash"] = self._hash(block)
            self.blocks.append(block)
            self._save()
            return block["hash"][:18]

    def verify(self):
        for i in range(1, len(self.blocks)):
            current = self.blocks[i]
            previous = self.blocks[i - 1]
            if current["previous_hash"] != previous["hash"]:
                return {"valid": False, "failed_block": i}
            if current["hash"] != self._hash({
                "index": current["index"],
                "timestamp": current["timestamp"],
                "data": current["data"],
                "previous_hash": current["previous_hash"],
            }):
                return {"valid": False, "failed_block": i}
        return {"valid": True, "blocks": len(self.blocks)}


ledger = LocalAuditLedger()
