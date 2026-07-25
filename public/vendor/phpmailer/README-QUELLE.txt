PHPMailer, Version 7.1.1, manuell besorgt von:
https://github.com/PHPMailer/PHPMailer/tree/v7.1.1/src

Nur die drei für den einfachen SMTP-Versand nötigen Dateien (Exception.php,
PHPMailer.php, SMTP.php) – kein Composer nötig, läuft direkt so auf dem
IONOS-Webspace.

Bei einem Update: die drei Dateien aus einem neuen Release-Tag ersetzen,
sonst nichts anpassen (contact.php nutzt nur die öffentliche API).
