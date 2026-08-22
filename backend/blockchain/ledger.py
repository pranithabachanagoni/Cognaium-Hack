import hashlib
import json
from pathlib import Path
from threading import Lock

class LocalAuditLedger:
    """
    Minimal tamper-evident blockchain-style ledger for the hackathon MVP.
    Each block commits to the previous block hash.
    """

    def __init__(self):
        self.blocks = []
        self.lock = Lock()
        self._append_genesis()

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
                "timestamp": __import__("time").time(),
                "data": data,
                "previous_hash": self.blocks[-1]["hash"],
            }
            block["hash"] = self._hash(block)
            self.blocks.append(block)
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
