<?php
/**
 * Signiert/prüft die Links in den "Meine Buchung"-E-Mails, damit nur der
 * Gast, der die E-Mail bekommen hat, seine Reservierung sehen kann --
 * ohne eigene Datenbank (die Smoobu-Reservierungs-ID selbst ist erratbar/
 * fortlaufend, der Token macht sie erst zu einem echten Zugriffsschlüssel).
 *
 * token = erste 22 Zeichen von Base64url(HMAC-SHA256(BOOKING_LINK_SECRET, id))
 * Erwartet BOOKING_LINK_SECRET aus smtp-config.php.
 */

function booking_link_token(int $reservationId): string {
    $raw = hash_hmac('sha256', (string) $reservationId, BOOKING_LINK_SECRET, true);
    $b64 = rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
    return substr($b64, 0, 22);
}

function booking_link_token_valid(int $reservationId, string $token): bool {
    return hash_equals(booking_link_token($reservationId), $token);
}

// Ein einziges meine-buchung.php bedient beide Sprachen über ?lang=en/de
// (kein /en/-Seitenpfad -- das ist ein PHP-Skript aus public/, keine
// Astro-Seite, und soll nicht dupliziert werden müssen).
function booking_link_url(int $reservationId, string $lang = 'de'): string {
    $token = booking_link_token($reservationId);
    $url = 'https://rosengarten.casa/meine-buchung.php?id=' . $reservationId . '&token=' . $token;
    if ($lang === 'en') {
        $url .= '&lang=en';
    }
    return $url;
}
