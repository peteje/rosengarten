<?php
/**
 * Gast-Statusseite: erreichbar nur über den personalisierten Link aus der
 * "Meine Buchung"-Mail (siehe webhook-smoobu.php), kein Login nötig. Zeigt
 * die Reservierung read-only an; eine Änderungs-/Storno-Anfrage schickt eine
 * E-Mail an den Vermieter statt die Buchung live über die API zu ändern
 * (die Storno-Staffelung aus der AGB lässt sich nicht 1:1 über die
 * Smoobu-API abbilden -- menschliche Prüfung bleibt sicherer).
 *
 * Kein noindex-Meta nötig zusätzlich zum Header (siehe unten) -- die Seite
 * ist ohnehin nur mit korrektem Token aufrufbar.
 */

require __DIR__ . '/lib/smoobu-api.php';
require __DIR__ . '/lib/booking-link.php';

header('X-Robots-Tag: noindex, nofollow');

$configFile = __DIR__ . '/smtp-config.php';
$configured = file_exists($configFile);
if ($configured) {
    require $configFile;
}

$lang = ($_GET['lang'] ?? '') === 'en' ? 'en' : 'de';
$id = (int) ($_GET['id'] ?? 0);
$token = (string) ($_GET['token'] ?? '');

$t = $lang === 'en' ? [
    'title' => 'My Booking',
    'invalidTitle' => 'Link not valid',
    'invalidText' => 'This link is incomplete or incorrect. Please use the link from your booking confirmation email, or get in touch with us directly.',
    'notFoundTitle' => 'Booking not found',
    'notFoundText' => 'We could not find this booking. Please contact us directly so we can help.',
    'contactLink' => 'Contact us',
    'apartment' => 'Apartment',
    'arrival' => 'Arrival',
    'departure' => 'Departure',
    'guests' => 'Guests',
    'price' => 'Total price',
    'prepayment' => 'Deposit',
    'paid' => 'paid',
    'open' => 'open',
    'cancelledNotice' => 'This booking has been cancelled.',
    'requestHeading' => 'Request a change or cancellation',
    'requestText' => 'Let us know what you’d like to change – we’ll get back to you personally. (For instant help, you can also just reply to your confirmation email or call us.)',
    'messageLabel' => 'Your message',
    'send' => 'Send request',
    'sentTitle' => 'Thank you!',
    'sentText' => 'Your request has been sent. We’ll get back to you as soon as possible.',
    'backHome' => 'Back to homepage',
] : [
    'title' => 'Meine Buchung',
    'invalidTitle' => 'Link nicht gültig',
    'invalidText' => 'Dieser Link ist unvollständig oder falsch. Bitte nutzen Sie den Link aus Ihrer Buchungsbestätigungs-E-Mail, oder wenden Sie sich direkt an uns.',
    'notFoundTitle' => 'Buchung nicht gefunden',
    'notFoundText' => 'Wir konnten diese Buchung nicht finden. Bitte kontaktieren Sie uns direkt, wir helfen gerne weiter.',
    'contactLink' => 'Kontakt aufnehmen',
    'apartment' => 'Wohnung',
    'arrival' => 'Anreise',
    'departure' => 'Abreise',
    'guests' => 'Personen',
    'price' => 'Gesamtpreis',
    'prepayment' => 'Anzahlung',
    'paid' => 'bezahlt',
    'open' => 'offen',
    'cancelledNotice' => 'Diese Buchung wurde storniert.',
    'requestHeading' => 'Änderung oder Stornierung anfragen',
    'requestText' => 'Sagen Sie uns, was Sie ändern möchten – wir melden uns persönlich zurück. (Für schnelle Hilfe können Sie auch einfach auf Ihre Bestätigungs-E-Mail antworten oder anrufen.)',
    'messageLabel' => 'Ihre Nachricht',
    'send' => 'Anfrage senden',
    'sentTitle' => 'Vielen Dank!',
    'sentText' => 'Ihre Anfrage wurde verschickt. Wir melden uns so schnell wie möglich bei Ihnen.',
    'backHome' => 'Zurück zur Startseite',
];

function h(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

function render_shell(string $lang, string $title, string $bodyHtml): void {
    ?><!doctype html>
<html lang="<?= h($lang) ?>">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title><?= h($title) ?> · Villa Rosengarten</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#faf7f1; color:#2b2823; margin:0; padding:2.5rem 1.25rem; line-height:1.6; }
  .card { max-width:520px; margin:0 auto; background:#fff; border-radius:12px; padding:2rem; box-shadow:0 2px 16px rgba(0,0,0,0.06); }
  h1 { color:#33302a; font-size:1.5rem; margin-top:0; }
  dl { display:grid; grid-template-columns:auto 1fr; gap:0.4rem 1rem; margin:1.25rem 0; }
  dt { color:#776; font-weight:600; }
  dd { margin:0; }
  .notice { background:#fbe4e4; color:#7a1f1f; padding:0.85rem 1rem; border-radius:8px; margin-bottom:1.25rem; }
  textarea { width:100%; box-sizing:border-box; min-height:110px; padding:0.6rem; border:1px solid #ddd; border-radius:8px; font:inherit; margin-bottom:1rem; }
  .btn { display:inline-block; background:#c2673b; color:#fff; padding:0.7rem 1.4rem; border-radius:999px; text-decoration:none; font-weight:600; border:none; cursor:pointer; font-size:1rem; }
  .btn:hover { background:#a5542c; }
  a { color:#c2673b; }
  hr { border:none; border-top:1px solid #eee; margin:2rem 0; }
</style>
</head>
<body>
<div class="card"><?= $bodyHtml ?></div>
</body>
</html><?php
}

if ($id <= 0 || $token === '' || !$configured || !defined('BOOKING_LINK_SECRET') || BOOKING_LINK_SECRET === '' || !booking_link_token_valid($id, $token)) {
    render_shell($lang, $t['invalidTitle'], '<h1>' . h($t['invalidTitle']) . '</h1><p>' . h($t['invalidText']) . '</p><p><a href="/' . ($lang === 'en' ? 'en/' : '') . 'kontakt/">' . h($t['contactLink']) . ' →</a></p>');
    exit;
}

// --- Änderungs-/Storno-Anfrage abschicken ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'request') {
    $message = trim($_POST['message'] ?? '');
    if ($message !== '' && defined('SMTP_HOST') && SMTP_HOST !== '') {
        require __DIR__ . '/vendor/phpmailer/Exception.php';
        require __DIR__ . '/vendor/phpmailer/PHPMailer.php';
        require __DIR__ . '/vendor/phpmailer/SMTP.php';
        try {
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = SMTP_HOST;
            $mail->Port = SMTP_PORT;
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
            $mail->SMTPAuth = true;
            $mail->Username = SMTP_USER;
            $mail->Password = SMTP_PASSWORD;
            $mail->CharSet = 'UTF-8';
            $mail->setFrom(SMTP_USER, 'Villa Rosengarten Website');
            $mail->addAddress('info@rosengarten.casa');
            $mail->Subject = 'Änderungs-/Storno-Anfrage zu Reservierung #' . $id;
            $mail->Body = "Anfrage über die Buchungsstatus-Seite (Reservierungs-ID {$id}):\n\n{$message}\n";
            $mail->send();
        } catch (\Throwable $e) {
            // Stiller Fallback: Gast sieht trotzdem die Erfolgsmeldung nicht,
            // aber wir wollen hier keine sensiblen Fehlerdetails ausgeben.
            @file_put_contents(__DIR__ . '/mail-error.log', sprintf("[%s] meine-buchung Anfrage-Mail fehlgeschlagen (id %d): %s\n", date('Y-m-d H:i:s'), $id, $e->getMessage()), FILE_APPEND);
        }
    }
    render_shell($lang, $t['sentTitle'], '<h1>' . h($t['sentTitle']) . '</h1><p>' . h($t['sentText']) . '</p><p><a href="/' . ($lang === 'en' ? 'en/' : '') . '">' . h($t['backHome']) . '</a></p>');
    exit;
}

// --- Reservierung anzeigen ---
$reservation = smoobu_get_reservation($id);
if ($reservation === null) {
    render_shell($lang, $t['notFoundTitle'], '<h1>' . h($t['notFoundTitle']) . '</h1><p>' . h($t['notFoundText']) . '</p><p><a href="/' . ($lang === 'en' ? 'en/' : '') . 'kontakt/">' . h($t['contactLink']) . ' →</a></p>');
    exit;
}

$isCancelled = ($reservation['type'] ?? '') === 'cancellation';
$apartmentName = h($reservation['apartment']['name'] ?? '');
$arrival = h($reservation['arrival'] ?? '');
$departure = h($reservation['departure'] ?? '');
$adults = (int) ($reservation['adults'] ?? 0);
$children = (int) ($reservation['children'] ?? 0);
$guestsLabel = $children > 0 ? "{$adults} + {$children}" : (string) $adults;
$price = $reservation['price'] ?? null;
$pricePaid = (($reservation['price-paid'] ?? '') === 'Yes') ? $t['paid'] : $t['open'];
$prepayment = $reservation['prepayment'] ?? null;

$body = '<h1>' . h($t['title']) . '</h1>';
if ($isCancelled) {
    $body .= '<p class="notice">' . h($t['cancelledNotice']) . '</p>';
}
$body .= '<dl>';
if ($apartmentName !== '') $body .= '<dt>' . h($t['apartment']) . '</dt><dd>' . $apartmentName . '</dd>';
if ($arrival !== '') $body .= '<dt>' . h($t['arrival']) . '</dt><dd>' . $arrival . '</dd>';
if ($departure !== '') $body .= '<dt>' . h($t['departure']) . '</dt><dd>' . $departure . '</dd>';
if ($adults > 0) $body .= '<dt>' . h($t['guests']) . '</dt><dd>' . h($guestsLabel) . '</dd>';
if ($price !== null) $body .= '<dt>' . h($t['price']) . '</dt><dd>' . h((string) $price) . ' € (' . h($pricePaid) . ')</dd>';
if ($prepayment !== null && $prepayment > 0) $body .= '<dt>' . h($t['prepayment']) . '</dt><dd>' . h((string) $prepayment) . ' €</dd>';
$body .= '</dl>';

if (!$isCancelled) {
    $body .= '<hr />';
    $body .= '<h2 style="font-size:1.15rem;">' . h($t['requestHeading']) . '</h2>';
    $body .= '<p style="color:#776;">' . h($t['requestText']) . '</p>';
    $actionUrl = '/meine-buchung.php?id=' . $id . '&token=' . h($token) . ($lang === 'en' ? '&lang=en' : '');
    $body .= '<form method="POST" action="' . $actionUrl . '">';
    $body .= '<input type="hidden" name="action" value="request" />';
    $body .= '<label for="message" style="font-weight:600; display:block; margin-bottom:0.4rem;">' . h($t['messageLabel']) . '</label>';
    $body .= '<textarea id="message" name="message" required></textarea>';
    $body .= '<button class="btn" type="submit">' . h($t['send']) . '</button>';
    $body .= '</form>';
}

render_shell($lang, $t['title'], $body);
