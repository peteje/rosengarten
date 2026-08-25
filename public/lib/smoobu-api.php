<?php
/**
 * Smoobu-API-Zugriff zur LAUFZEIT (nicht zur Build-Zeit -- dafür siehe
 * src/lib/prices.js). Genutzt von webhook-smoobu.php und meine-buchung.php.
 *
 * HMAC-Signierung nach Smoobu-Doku (https://docs.smoobu.com/#authentication):
 * canonical string = METHOD\nPATH\nQUERY\nTIMESTAMP\nNONCE\nBODY_SHA256\nAPI_KEY
 * signiert mit HMAC-SHA256(secret), Base64-kodiert. Identisches Verfahren
 * wie in src/lib/prices.js (dort JS/Build-Zeit, hier PHP/Laufzeit).
 *
 * Erwartet SMOOBU_API_KEY + SMOOBU_API_SECRET aus smtp-config.php.
 */

define('SMOOBU_API_HOST', 'https://login.smoobu.com');

// trim() gegen unsichtbare Leerzeichen/Zeilenumbrüche, die beim Einfügen der
// GitHub-Secrets leicht mit reinrutschen und die HMAC-Signatur sonst still
// verfälschen (Smoobu antwortet dann mit einem sauberen 401, ohne Hinweis
// auf die eigentliche Ursache).
function smoobu_api_key(): string {
    return trim(SMOOBU_API_KEY);
}
function smoobu_api_secret(): string {
    return trim(SMOOBU_API_SECRET);
}

function smoobu_hmac_headers(string $method, string $path, string $query, string $body): array {
    $timestamp = gmdate('Y-m-d\TH:i:s\Z');
    $nonce = bin2hex(random_bytes(16));
    $bodyHash = hash('sha256', $body);
    $apiKey = smoobu_api_key();

    $canonical = implode("\n", [$method, $path, $query, $timestamp, $nonce, $bodyHash, $apiKey]);
    $signature = base64_encode(hash_hmac('sha256', $canonical, smoobu_api_secret(), true));

    return [
        'X-API-Key: ' . $apiKey,
        'X-Timestamp: ' . $timestamp,
        'X-Nonce: ' . $nonce,
        'X-Signature: ' . $signature,
    ];
}

/**
 * Führt einen signierten Smoobu-API-Request aus.
 * $query: bereits fertig zusammengesetzter Query-String ohne führendes "?" (oder '').
 * $body: JSON-String des Request-Bodys (oder '' bei GET/DELETE ohne Body).
 * Gibt [httpStatus, decodedJsonOrNull] zurück.
 */
function smoobu_api_request(string $method, string $path, string $query, string $body = ''): array {
    $headers = smoobu_hmac_headers($method, $path, $query, $body);
    $headers[] = 'Content-Type: application/json';

    $url = SMOOBU_API_HOST . $path . ($query !== '' ? '?' . $query : '');

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    if ($body !== '') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $decoded = $response !== false ? json_decode($response, true) : null;
    return [$status, $decoded];
}

/**
 * Holt eine einzelne Reservierung. Gibt das Reservierungs-Array zurück oder
 * null, falls nicht gefunden / Fehler.
 */
function smoobu_get_reservation(int $reservationId): ?array {
    [$status, $data] = smoobu_api_request('GET', '/api/reservations/' . $reservationId, '');
    if ($status !== 200 || !is_array($data)) {
        return null;
    }
    return $data;
}
