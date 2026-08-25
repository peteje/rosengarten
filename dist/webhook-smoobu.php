<?php
/**
 * Empfängt Smoobu-Webhooks (Settings -> Advanced -> API Keys -> Webhook-URL
 * eintragen, siehe DEPLOY.md/README für die genaue Registrierung). Bei einer
 * neuen Buchung (action "newReservation") verschickt dieses Skript eine
 * E-Mail an den Gast mit einem personalisierten Link zu meine-buchung.php,
 * wo er seine Reservierung einsehen kann, ohne sich irgendwo einzuloggen.
 *
 * WICHTIG: Smoobu signiert eingehende Webhooks nicht (siehe
 * https://docs.smoobu.com/#webhooks) -- als Ersatz muss die registrierte
 * URL das Token als ?token=... enthalten (siehe SMOOBU_WEBHOOK_TOKEN).
 * Zusätzlich wird die Buchung nie direkt aus dem Webhook-Payload übernommen,
 * sondern nach Empfang per authentifiziertem API-Call neu abgerufen -- ein
 * gefälschter Webhook-Aufruf kann höchstens eine ECHTE, bereits existierende
 * Reservierung erneut per Mail verschicken, aber keine falschen Daten
 * einschleusen.
 */

require __DIR__ . '/lib/smoobu-api.php';
require __DIR__ . '/lib/booking-link.php';
require __DIR__ . '/vendor/phpmailer/Exception.php';
require __DIR__ . '/vendor/phpmailer/PHPMailer.php';
require __DIR__ . '/vendor/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\Exception as PHPMailerException;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

function webhook_log(string $message): void {
    $line = sprintf("[%s] %s\n", date('Y-m-d H:i:s'), $message);
    @file_put_contents(__DIR__ . '/mail-error.log', $line, FILE_APPEND);
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method not allowed']);
    exit;
}

$configFile = __DIR__ . '/smtp-config.php';
if (!file_exists($configFile)) {
    webhook_log('webhook-smoobu: smtp-config.php fehlt.');
    http_response_code(500);
    echo json_encode(['error' => 'not configured']);
    exit;
}
require $configFile;

if (!defined('SMOOBU_WEBHOOK_TOKEN') || SMOOBU_WEBHOOK_TOKEN === '' || !hash_equals(SMOOBU_WEBHOOK_TOKEN, $_GET['token'] ?? '')) {
    webhook_log('webhook-smoobu: ungültiges/fehlendes Token von ' . ($_SERVER['REMOTE_ADDR'] ?? '?'));
    http_response_code(403);
    echo json_encode(['error' => 'forbidden']);
    exit;
}

if (!defined('SMOOBU_API_KEY') || SMOOBU_API_KEY === '' || !defined('BOOKING_LINK_SECRET') || BOOKING_LINK_SECRET === '') {
    webhook_log('webhook-smoobu: SMOOBU_API_KEY oder BOOKING_LINK_SECRET nicht gesetzt.');
    http_response_code(500);
    echo json_encode(['error' => 'not configured']);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);

if (!is_array($payload) || ($payload['action'] ?? '') !== 'newReservation') {
    // Andere Webhook-Aktionen (updateRates, newMessage, ...) sind für uns
    // aktuell irrelevant -- einfach mit 200 quittieren, kein Fehler.
    echo json_encode(['ok' => true, 'skipped' => 'not newReservation']);
    exit;
}

$reservationId = (int) ($payload['data']['id'] ?? 0);
if ($reservationId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'missing reservation id']);
    exit;
}

// Interne Blockierungen (z.B. manuell gesperrte Tage) sind keine echten
// Gästebuchungen -- keine Mail verschicken.
if (!empty($payload['data']['is-blocked-booking'])) {
    echo json_encode(['ok' => true, 'skipped' => 'blocked booking']);
    exit;
}

// Duplikat-Schutz ohne Datenbank: Marker-Datei pro Reservierungs-ID. Smoobu
// kann Webhooks mehrfach zustellen (Retries) -- der Gast soll die Mail nur
// einmal bekommen.
$sentDir = __DIR__ . '/booking-emails-sent';
if (!is_dir($sentDir)) {
    @mkdir($sentDir, 0755, true);
}
$marker = $sentDir . '/' . $reservationId . '.txt';
if (file_exists($marker)) {
    echo json_encode(['ok' => true, 'skipped' => 'already sent']);
    exit;
}

// Nie dem Webhook-Payload direkt vertrauen (siehe Kommentar oben) --
// Reservierung frisch und authentifiziert nachladen.
$reservation = smoobu_get_reservation($reservationId);
if ($reservation === null) {
    webhook_log("webhook-smoobu: Reservierung {$reservationId} konnte nicht per API geladen werden.");
    http_response_code(502);
    // TEMPORÄR: Debug-Details in der Antwort, bis das Problem gefunden ist
    // (siehe smoobu-api.php $GLOBALS['smoobu_last_debug']) -- danach wieder
    // auf die schlichte Fehlermeldung zurückstellen.
    echo json_encode(['error' => 'reservation lookup failed', 'debug' => $GLOBALS['smoobu_last_debug'] ?? null]);
    exit;
}

$email = trim($reservation['email'] ?? '');
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    webhook_log("webhook-smoobu: Reservierung {$reservationId} hat keine gültige E-Mail-Adresse.");
    echo json_encode(['ok' => true, 'skipped' => 'no valid guest email']);
    exit;
}

$guestName = trim($reservation['guest-name'] ?? ($reservation['firstname'] ?? 'Gast'));
$apartmentName = $reservation['apartment']['name'] ?? '';
$arrival = $reservation['arrival'] ?? '';
$departure = $reservation['departure'] ?? '';
$lang = (strtolower($reservation['language'] ?? 'de') === 'en') ? 'en' : 'de';

$link = booking_link_url($reservationId, $lang);

if ($lang === 'en') {
    $subject = 'Your booking at Villa Rosengarten – manage it online';
    $body = "Hi {$guestName},\n\n"
        . "Thank you for your booking at Villa Rosengarten"
        . ($apartmentName ? " ({$apartmentName})" : '')
        . ($arrival && $departure ? ", {$arrival} to {$departure}" : '') . ".\n\n"
        . "You can view your booking details anytime here:\n{$link}\n\n"
        . "See you on Fehmarn!\nVilla Rosengarten\n";
} else {
    $subject = 'Ihre Buchung bei Villa Rosengarten – online verwalten';
    $body = "Hallo {$guestName},\n\n"
        . "vielen Dank für Ihre Buchung bei Villa Rosengarten"
        . ($apartmentName ? " ({$apartmentName})" : '')
        . ($arrival && $departure ? ", {$arrival} bis {$departure}" : '') . ".\n\n"
        . "Ihre Buchungsdetails können Sie jederzeit hier einsehen:\n{$link}\n\n"
        . "Wir freuen uns auf Sie auf Fehmarn!\nVilla Rosengarten\n";
}

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->Port       = SMTP_PORT;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASSWORD;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom(SMTP_USER, 'Villa Rosengarten');
    $mail->addAddress($email, $guestName);
    $mail->Subject = $subject;
    $mail->Body = $body;
    $mail->send();

    @file_put_contents($marker, date('Y-m-d H:i:s') . " {$email}\n");
    echo json_encode(['ok' => true]);
} catch (PHPMailerException $e) {
    webhook_log("webhook-smoobu: Mailversand an Reservierung {$reservationId} fehlgeschlagen: " . $mail->ErrorInfo);
    http_response_code(502);
    echo json_encode(['error' => 'mail failed']);
}
