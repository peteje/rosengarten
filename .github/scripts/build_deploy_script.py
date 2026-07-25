#!/usr/bin/env python3
"""Erzeugt ein lftp-Kommandoskript, das nur die seit dem letzten ERFOLGREICHEN
Deploy tatsächlich geänderten Dateien unter dist/ überträgt.

Warum ein echter Git-Diff statt lftp's eigenem Größen-/Zeitstempel-Vergleich:
actions/checkout setzt bei jedem Lauf alle Datei-Zeitstempel auf "jetzt"
zurück (Git speichert keine mtimes) -> Zeitstempel-Vergleich ist nutzlos.
Der Ausweg "nur nach Dateigröße vergleichen" (--ignore-time) ist aber
UNSICHER: ändert sich z.B. nur ein Hash-String in einer HTML-Datei (z.B. der
CSS-Dateiname nach einem CSS-Update), bleibt die Dateigröße oft exakt
gleich -> die Änderung würde fälschlich übersprungen und der Server würde
veraltete Dateien ausliefern (genau das ist einmal passiert). Ein Git-Diff
kennt den echten Inhalt und ist daher zuverlässig.

Vergleichsbasis ist der Git-Tag "deployed" (zeigt auf den zuletzt
ERFOLGREICH ausgelieferten Commit, wird vom Workflow nach jedem
erfolgreichen Deploy weitergesetzt) statt einfach HEAD~1 -- so werden auch
Änderungen aus einem fehlgeschlagenen vorherigen Deploy-Versuch beim
nächsten Mal korrekt nachgeholt statt stillschweigend übersprungen.

Ausgabe (eine Zeile auf stdout, vom Workflow ausgewertet):
  FULL_MIRROR              kein Vergleichs-Commit vorhanden -> alles hochladen
  NOTHING_TO_DO             keine Änderungen unter dist/
  SCRIPT_READY uploads=N deletes=M   lftp-Skript wurde nach /tmp/lftp-deploy.txt geschrieben
"""
import os
import subprocess
import sys

LFTP_SCRIPT_PATH = "/tmp/lftp-deploy.txt"


def git(*args) -> bytes:
    return subprocess.run(["git", *args], capture_output=True, check=True).stdout


def ref_exists(ref: str) -> bool:
    return subprocess.run(
        ["git", "rev-parse", "-q", "--verify", ref], capture_output=True
    ).returncode == 0


def lftp_quote(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def remote_path(server_dir: str, rel_path: str) -> str:
    base = server_dir.rstrip("/")
    return f"{base}/{rel_path}" if base else f"/{rel_path}"


def main() -> None:
    server_dir = sys.argv[1]
    base_ref = "refs/tags/deployed"

    if not ref_exists(base_ref):
        print("FULL_MIRROR")
        return

    raw = git(
        "diff", "--name-status", "-z", "--diff-filter=ACMRD", base_ref, "HEAD", "--", "dist/"
    )
    parts = raw.decode("utf-8").split("\0")
    if parts and parts[-1] == "":
        parts.pop()

    uploads: list[str] = []
    deletes: list[str] = []

    i = 0
    while i < len(parts):
        status = parts[i]
        i += 1
        code = status[0]
        if code in ("A", "M"):
            uploads.append(parts[i])
            i += 1
        elif code == "D":
            deletes.append(parts[i])
            i += 1
        elif code in ("R", "C"):
            old_path = parts[i]
            new_path = parts[i + 1]
            i += 2
            uploads.append(new_path)
            if code == "R":
                deletes.append(old_path)
        else:
            # Unbekannter Status-Code -> sicherheitshalber ignorieren statt zu raten.
            pass

    def rel(p: str) -> str:
        assert p.startswith("dist/"), f"Unerwarteter Pfad außerhalb von dist/: {p}"
        return p[len("dist/"):]

    uploads = [rel(p) for p in uploads]
    deletes = [rel(p) for p in deletes]

    if not uploads and not deletes:
        print("NOTHING_TO_DO")
        return

    lines = [
        "set sftp:auto-confirm yes;",
        "set net:timeout 20;",
        "set net:max-retries 2;",
    ]
    made_dirs: set[str] = set()
    for rel_path in uploads:
        d = os.path.dirname(rel_path)
        if d and d not in made_dirs:
            made_dirs.add(d)
            lines.append(f"mkdir -p -f {lftp_quote(remote_path(server_dir, d))};")
        local = f"dist/{rel_path}"
        lines.append(
            f"put {lftp_quote(local)} -o {lftp_quote(remote_path(server_dir, rel_path))};"
        )
    for rel_path in deletes:
        lines.append(f"rm -f {lftp_quote(remote_path(server_dir, rel_path))};")
    lines.append("bye;")

    with open(LFTP_SCRIPT_PATH, "w") as f:
        f.write("\n".join(lines) + "\n")

    print(f"SCRIPT_READY uploads={len(uploads)} deletes={len(deletes)}")


if __name__ == "__main__":
    main()
