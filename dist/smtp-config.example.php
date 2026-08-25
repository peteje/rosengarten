<?php
/**
 * Vorlage für smtp-config.php (wird von contact.php geladen).
 *
 * NICHT diese Datei mit echten Zugangsdaten befüllen und committen! Die
 * echte smtp-config.php wird vom Deploy-Workflow (.github/workflows/deploy.yml)
 * aus den GitHub-Secrets SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD/
 * TURNSTILE_SECRET_KEY/SMOOBU_API_KEY/SMOOBU_API_SECRET/BOOKING_LINK_SECRET/
 * SMOOBU_WEBHOOK_TOKEN erzeugt und direkt auf den Webspace hochgeladen –
 * sie existiert nie im Git-Repo.
 *
 * Nur relevant, falls die Zugangsdaten sich mal ändern (neues Postfach,
 * neues Passwort, neuer Turnstile-Secret-Key, neuer Smoobu-API-Schlüssel):
 * die GitHub-Secrets aktualisieren, nicht diese Datei.
 */

define('SMTP_HOST', 'smtp.ionos.de');
define('SMTP_PORT', 465);
define('SMTP_USER', 'webmaster@rosengarten.casa');
define('SMTP_PASSWORD', '...');

// Cloudflare Turnstile (Spam-Schutz Kontaktformular) – der Site-Key ist
// öffentlich und steht direkt in src/pages/kontakt/index.astro, nur der
// Secret-Key ist geheim.
define('TURNSTILE_SECRET_KEY', '...');

// Smoobu-API (HMAC) für die Laufzeit-Abrufe in webhook-smoobu.php und
// meine-buchung.php -- dieselben Zugangsdaten wie in ~/.villa-secrets.env
// (Settings -> Advanced -> API Keys in Smoobu).
define('SMOOBU_API_KEY', 'usr_live_...');
define('SMOOBU_API_SECRET', '...');

// Frei gewähltes, langes Zufalls-Secret (z.B. `openssl rand -hex 32`) zum
// Signieren der Links in den "Meine Buchung"-E-Mails.
define('BOOKING_LINK_SECRET', '...');

// Frei gewähltes Token, das beim Registrieren der Webhook-URL in Smoobu als
// ?token=... an die URL angehängt wird (Smoobu signiert eingehende Webhooks
// nicht selbst -- dieses Token ist unser Ersatz dafür).
define('SMOOBU_WEBHOOK_TOKEN', '...');
