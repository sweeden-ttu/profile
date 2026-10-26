"""Optional push to a self-hosted Evidently UI (`evidently ui --workspace ...`), stdlib only.

Only used when EVIDENTLY_URL is set. Routing rules (one surface per kind of thing):

* prompt versions  -> /prompts   (prompt = user/system message, feedback = assistant message)
* agent-step spans -> /traces    (ONE tracing dataset per project, named "trace"; via tracely)
* experiments      -> /datasets  (ONE ledger dataset named "experiments", appended to)
* Reports          -> snapshots  (RemoteWorkspace.add_run, include_data=False)

Endpoints verified against Evidently UI 0.7.23 running locally.
"""
from __future__ import annotations

import csv
import datetime as dt
import io
import json
import re
import urllib.error
import urllib.parse
import urllib.request
import uuid
from typing import Any, Dict, Iterable, List, Optional


class EvidentlyREST:
    def __init__(self, base_url: str, token: Optional[str] = None, timeout: float = 60.0):
        self.base, self.token, self.timeout = base_url.rstrip("/"), token, timeout

    # -- transport -----------------------------------------------------------------
    def req(self, path: str, method: str = "GET", body: Any = None, params: Optional[dict] = None,
            raw: Optional[bytes] = None, ctype: Optional[str] = None) -> Any:
        url = self.base + path + (("?" + urllib.parse.urlencode(params, doseq=True)) if params else "")
        headers = {"accept": "application/json"}
        if self.token:
            headers["evidently-secret"] = self.token
        data = raw
        if body is not None:
            data, headers["content-type"] = json.dumps(body, default=str).encode(), "application/json"
        if ctype:
            headers["content-type"] = ctype
        r = urllib.request.Request(url, data=data, method=method, headers=headers)
        with urllib.request.urlopen(r, timeout=self.timeout) as resp:
            text = resp.read().decode()
            return json.loads(text) if text else None

    # -- projects -----------------------------------------------------------------
    def project_id(self, name: str, description: str = "") -> str:
        """Return the id of project `name`, creating it via the SDK if missing."""
        for p in self.req("/api/projects") or []:
            if p["name"] == name or p["id"] == name:
                return p["id"]
        from evidently.ui.workspace import RemoteWorkspace

        ws = RemoteWorkspace(self.base, secret=self.token)
        project = ws.create_project(name, description=description or None)
        return str(project.id)

    # -- prompts ------------------------------------------------------------------
    def push_prompt_version(self, pid: str, name: str, version: int, messages: List[Dict[str, str]],
                            metadata: Optional[dict] = None) -> Optional[dict]:
        """Create prompt `name` if needed and add `version` (skipped if it already exists)."""
        quoted = urllib.parse.quote(name, safe="")
        try:
            p = self.req(f"/api/prompts/by-name/{quoted}", params={"project_id": pid})
        except urllib.error.HTTPError:
            p = None
        if not p:
            p = self.req("/api/prompts/", "POST", {"name": name, "metadata": {}}, params={"project_id": pid})
        existing = {v["version"] for v in self.req(f"/api/prompts/{p['id']}/versions") or []}
        if version in existing:
            return None
        return self.req(f"/api/prompts/{p['id']}/versions", "POST", {
            "version": version, "content_type": "messages", "metadata": metadata or {},
            "content": {"type": "evidently:prompt_content:MessagesPromptContent", "messages": messages},
        })

    # -- datasets -----------------------------------------------------------------
    def list_datasets(self, pid: str) -> List[dict]:
        return self.req("/api/datasets/", params={"project_id": pid})["datasets"]

    def read_rows(self, pid: str, did: str) -> List[dict]:
        d = self.req(f"/api/datasets/{did}", params={"project_id": pid, "page_size": 100000})
        cols = [c["name"] for c in d["metadata"]["columns"]]
        return [dict(zip(cols, r)) for r in d["items"]]

    def upload_rows(self, pid: str, rows: Iterable[dict], name: str, description: str = "",
                    tags: Iterable[str] = ()) -> str:
        rows = list(rows)
        cols = sorted({k for r in rows for k in r}, key=lambda c: (c not in ("input", "output", "timestamp"), c))
        buf = io.StringIO()
        w = csv.DictWriter(buf, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow({k: (json.dumps(v) if isinstance(v, (dict, list)) else v) for k, v in r.items()})
        b = "----evllama" + uuid.uuid4().hex
        fields = {"name": name, "description": description, "tags_str": json.dumps(list(tags)), "metadata_str": "{}"}
        parts = [f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode() for k, v in fields.items()]
        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        parts.append(f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="{slug}.csv"\r\n'
                     f"Content-Type: application/octet-stream\r\n\r\n".encode() + buf.getvalue().encode() + b"\r\n")
        parts.append(f"--{b}--\r\n".encode())
        res = self.req("/api/datasets/upload", "POST", raw=b"".join(parts), params={"project_id": pid},
                       ctype=f"multipart/form-data; boundary={b}")
        return res["dataset"]["id"]

    def append_experiment(self, pid: str, row: Dict[str, Any]) -> str:
        """The ONE ledger: read existing `experiments` rows, add, re-upload, delete old copy."""
        row = {"timestamp": dt.datetime.now(dt.timezone.utc).isoformat(), **row}
        row.setdefault("input", row.get("config", ""))
        row.setdefault("output", row.get("score", ""))
        old = [d for d in self.list_datasets(pid) if d["name"] == "experiments" and d.get("origin") != "tracing"]
        rows = [r for d in old for r in self.read_rows(pid, d["id"])] + [row]
        new_id = self.upload_rows(pid, rows, "experiments", "single experiments ledger (append-only)", ["experiments"])
        for d in old:
            self.req(f"/api/datasets/{d['id']}", "DELETE", params={"project_id": pid})
        return new_id
