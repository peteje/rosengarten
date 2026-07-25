<?php
/**
 * Kontaktformular-Skript für IONOS-Webspace, Versand per SMTP (PHPMailer).
 *
 * Warum SMTP statt PHP mail(): mail() hat auf diesem Webspace zuverlässig
 * false geliefert, ohne jede PHP-Warnung, obwohl mail() vorhanden ist und
 * sendmail_path gesetzt war (siehe mail-error.log-Historie) – ein Zeichen,
 * dass der lokale sendmail-Aufruf (fork/exec) auf Infrastruktur-Ebene
 * unterbunden wird. SMTP nutzt stattdessen eine normale Netzwerkverbindung
 * und umgeht das Problem komplett.
 *
 * PHPMailer liegt als Bibliothek unter vendor/phpmailer/ (manuell besorgt,
 * kein Composer nötig – siehe vendor/phpmailer/README-QUELLE.txt).
 *
 * SMTP-Zugangsdaten stehen NICHT hier im Code (dieses Repo ist öffentlich!),
 * sondern in smtp-config.php im selben Ordner. Diese Datei wird vom
 * Deploy-Workflow aus GitHub-Secrets erzeugt und direkt auf den Webspace
 * hochgeladen – sie ist nie Teil des Git-Repos (siehe .gitignore) und wird
 * vom normalen dist/-Sync nie angefasst oder gelöscht.
 *
 * Diese Datei bleibt in public/ -> landet beim Build automatisch als
 * dist/contact.php und damit im Webspace-Root neben index.html.
 */

require __DIR__ . '/vendor/phpmailer/Exception.php';
require __DIR__ . '/vendor/phpmailer/PHPMailer.php';
require __DIR__ . '/vendor/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\Exception as PHPMailerException;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

$to = 'info@rosengarten.casa'; // Empfänger der Kontaktanfragen

function redirect_error(string $reason): void {
    header('Location: /kontakt/?error=' . urlencode($reason));
    exit;
}

function log_line(string $message): void {
    // mail-error.log liegt neben contact.php im Webspace-Root, ist aber per
    // .htaccess (FilesMatch \.log$) vor öffentlichem HTTP-Zugriff gesperrt.
    $line = sprintf("[%s] %s\n", date('Y-m-d H:i:s'), $message);
    @file_put_contents(__DIR__ . '/mail-error.log', $line, FILE_APPEND);
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

// Header-Injection verhindern: keine Zeilenumbrüche in Feldern zulassen.
$name  = str_replace(["\r", "\n"], '', $name);
$email = str_replace(["\r", "\n"], '', $email);

$configFile = __DIR__ . '/smtp-config.php';
if (!file_exists($configFile)) {
    log_line('smtp-config.php fehlt -> kann keine Mail versenden (wurde sie hochgeladen?).');
    redirect_error('send');
}
require $configFile; // definiert SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD

$debugLog = '';
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->Port       = SMTP_PORT;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Port 465, implizites SSL/TLS
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASSWORD;
    $mail->CharSet    = 'UTF-8';
    $mail->SMTPDebug  = SMTP::DEBUG_SERVER;
    $mail->Debugoutput = function ($str) use (&$debugLog) {
        $debugLog .= $str . "\n";
    };

    $mail->setFrom(SMTP_USER, 'Villa Rosengarten Website');
    $mail->addAddress($to);
    $mail->addReplyTo($email, $name);

    $mail->Subject = 'Neue Kontaktanfrage über die Website';
    $mail->Body = "Neue Nachricht über das Kontaktformular auf rosengarten.casa:\n\n"
                . "Name: {$name}\n"
                . "E-Mail: {$email}\n\n"
                . "Nachricht:\n{$message}\n";

    $mail->send();
    header('Location: /kontakt/danke/');
} catch (PHPMailerException $e) {
    log_line('PHPMailer-Fehler: ' . $mail->ErrorInfo . " | SMTP-Protokoll:\n" . $debugLog);
    redirect_error('send');
}
exit;
