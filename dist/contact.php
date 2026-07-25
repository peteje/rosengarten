<?php
/**
 * Einfaches Kontaktformular-Skript für IONOS-Webspace (PHP mail()).
 * Läuft direkt im Webspace, ohne Drittanbieter (Formspree o.ä.).
 *
 * Empfänger/Absender sind unten gesetzt:
 * - $to   = info@rosengarten.casa  (Empfänger der Anfragen)
 * - $from = noreply@rosengarten.casa (Absender DER EIGENEN DOMAIN – wichtig für
 *   Zustellbarkeit; viele Spamfilter lehnen mail() ab, wenn der Absender nicht
 *   zur Domain des Servers passt).
 *
 * Hinweise:
 * - Diese Datei bleibt in public/ -> landet beim Build automatisch als
 *   dist/contact.php und damit im Webspace-Root neben index.html.
 * - mail() funktioniert nur, wenn das Skript tatsächlich auf dem
 *   IONOS-Webspace läuft (nicht im lokalen "astro dev"-Server).
 */

$to   = 'info@rosengarten.casa';    // Empfänger der Kontaktanfragen
$from = 'noreply@rosengarten.casa'; // Absender (Adresse der eigenen Domain)

function redirect_error(string $reason): void {
    header('Location: /kontakt/?error=' . urlencode($reason));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_error('method');
}

// Honeypot-Feld: unsichtbar für Menschen, wird nur von Spam-Bots ausgefüllt.
// Erfolg vortäuschen, damit Bots nichts merken, aber nichts verschicken.
if (!empty($_POST['website'])) {
    header('Location: /kontakt/danke/');
    exit;
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    redirect_error('missing');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    redirect_error('email');
}

// Header-Injection verhindern: keine Zeilenumbrüche in Feldern zulassen,
// die in Mail-Headern landen (Name wird zwar nur im Body verwendet,
// sicherheitshalber trotzdem bereinigt).
$name  = str_replace(["\r", "\n"], '', $name);
$email = str_replace(["\r", "\n"], '', $email);

$subject = 'Neue Kontaktanfrage über die Website';
$body = "Neue Nachricht über das Kontaktformular auf rosengarten.casa:\n\n"
      . "Name: {$name}\n"
      . "E-Mail: {$email}\n\n"
      . "Nachricht:\n{$message}\n";

$headers = [
    'From: ' . $from,
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

// error_get_last() greift bei mail()-Fehlern oft ins Leere (viele Hoster
// unterdrücken die Warnung je nach php.ini). Deshalb die Warnung, die
// mail() intern per trigger_error() auslöst, direkt selbst abfangen.
$mailWarning = null;
set_error_handler(function ($errno, $errstr) use (&$mailWarning) {
    $mailWarning = $errstr;
    return true;
});
$sent = mail($to, $subject, $body, implode("\r\n", $headers));
restore_error_handler();

if ($sent) {
    header('Location: /kontakt/danke/');
} else {
    // Diagnose-Log, da mail() auf IONOS bisher immer false liefert und wir
    // sonst blind wären. mail-error.log liegt neben contact.php im
    // Webspace-Root, ist aber per .htaccess (FilesMatch \.log$) vor
    // öffentlichem HTTP-Zugriff gesperrt -> nur per FTP/SFTP einsehbar.
    $line = sprintf(
        "[%s] mail() lieferte false. PHP-Warnung: %s | mail()-Funktion vorhanden: %s | sendmail_path: %s | PHP-Version: %s\n",
        date('Y-m-d H:i:s'),
        $mailWarning ?? '(keine Warnung ausgelöst)',
        function_exists('mail') ? 'ja' : 'nein',
        ini_get('sendmail_path') ?: '(leer)',
        phpversion()
    );
    @file_put_contents(__DIR__ . '/mail-error.log', $line, FILE_APPEND);
    redirect_error('send');
}
exit;
