#!/usr/bin/env python3
"""Erzeugt /tmp/smtp-config.php aus den SMTP_*/SMOOBU_*-GitHub-Secrets.

Diese Datei landet NIE im Git-Repo (das Repo ist öffentlich!) -- sie wird
hier nur transient im CI-Runner geschrieben und im nächsten Workflow-Schritt
direkt per SFTP auf den Webspace hochgeladen. Siehe public/contact.php,
public/webhook-smoobu.php, public/meine-buchung.php und
public/smtp-config.example.php.

Gibt eine Zeile auf stdout aus:
  SKIP      kein SMTP_HOST-Secret gesetzt -> nichts zu tun
  WRITTEN   Datei wurde geschrieben
"""
import os
import sys

OUTPUT_PATH = "/tmp/smtp-config.php"


def php_single_quote(s: str) -> str:
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def main() -> None:
    host = os.environ.get("SMTP_HOST", "")
    port = os.environ.get("SMTP_PORT", "")
    user = os.environ.get("SMTP_USER", "")
    password = os.environ.get("SMTP_PASSWORD", "")
    turnstile_secret = os.environ.get("TURNSTILE_SECRET_KEY", "")
    smoobu_api_key = os.environ.get("SMOOBU_API_KEY", "")
    smoobu_api_secret = os.environ.get("SMOOBU_API_SECRET", "")
    booking_link_secret = os.environ.get("BOOKING_LINK_SECRET", "")
    smoobu_webhook_token = os.environ.get("SMOOBU_WEBHOOK_TOKEN", "")

    if not host:
        print("SKIP")
        return

    try:
        port_int = int(port)
    except ValueError:
        print(f"FEHLER: SMTP_PORT ist keine Zahl: {port!r}", file=sys.stderr)
        sys.exit(1)

    content = (
        "<?php\n"
        f"define('SMTP_HOST', {php_single_quote(host)});\n"
        f"define('SMTP_PORT', {port_int});\n"
        f"define('SMTP_USER', {php_single_quote(user)});\n"
        f"define('SMTP_PASSWORD', {php_single_quote(password)});\n"
        f"define('TURNSTILE_SECRET_KEY', {php_single_quote(turnstile_secret)});\n"
        f"define('SMOOBU_API_KEY', {php_single_quote(smoobu_api_key)});\n"
        f"define('SMOOBU_API_SECRET', {php_single_quote(smoobu_api_secret)});\n"
        f"define('BOOKING_LINK_SECRET', {php_single_quote(booking_link_secret)});\n"
        f"define('SMOOBU_WEBHOOK_TOKEN', {php_single_quote(smoobu_webhook_token)});\n"
    )
    with open(OUTPUT_PATH, "w") as f:
        f.write(content)
    print("WRITTEN")


if __name__ == "__main__":
    main()
