<?php
/**
 * Vorlage für smtp-config.php (wird von contact.php geladen).
 *
 * NICHT diese Datei mit echten Zugangsdaten befüllen und committen! Die
 * echte smtp-config.php wird vom Deploy-Workflow (.github/workflows/deploy.yml)
 * aus den GitHub-Secrets SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD erzeugt
 * und direkt auf den Webspace hochgeladen – sie existiert nie im Git-Repo.
 *
 * Nur relevant, falls die Zugangsdaten sich mal ändern (neues Postfach,
 * neues Passwort): die GitHub-Secrets aktualisieren, nicht diese Datei.
 */

define('SMTP_HOST', 'smtp.ionos.com');
define('SMTP_PORT', 465);
define('SMTP_USER', 'webmaster@rosengarten.casa');
define('SMTP_PASSWORD', '...');
