// Holt die "ab"-Preise zur BUILD-ZEIT aus der Smoobu-API und backt sie fest
// in die statischen Seiten. Die Zugangsdaten werden NUR hier beim Bauen aus
// Umgebungsvariablen gelesen – sie landen nie im Repo oder im Browser.
//
// Smoobu-Authentifizierung (aktuell = HMAC, zwei Teile):
//   SMOOBU_API_KEY     -> der Schlüssel (beginnt mit "usr_...")
//   SMOOBU_API_SECRET  -> das Secret ("Verschlüsselung")
// Jede Anfrage wird damit signiert (Header X-API-Key/X-Timestamp/X-Nonce/
// X-Signature). Ist nur SMOOBU_API_KEY (ohne Secret) gesetzt, wird der alte
// Einzel-Key-Header "Api-Key" verwendet (von Smoobu bis 25.09.2026 unterstützt).
//
// Build mit Preisabruf (Zugangsdaten als Umgebungsvariablen übergeben):
//   docker run --rm -e SMOOBU_API_KEY="usr_live_…" -e SMOOBU_API_SECRET="…" \
//     -v "$PWD":/app -w /app node:22-alpine sh -c "npm run build"
//
// Ohne gesetzte Zugangsdaten (oder bei Fehler) werden automatisch die manuell
// gepflegten priceFrom-Werte aus src/data/apartments.js verwendet – der Build
// schlägt nie fehl. "ab"-Preis = günstigster Tagespreis über die nächsten 365 Tage.

import crypto from 'node:crypto';
import { apartments } from '../data/apartments.js';

const API_KEY = process.env.SMOOBU_API_KEY;
const API_SECRET = process.env.SMOOBU_API_SECRET;
const API_HOST = 'https://login.smoobu.com';
const API_PATH = '/api/rates';
const EMPTY_BODY_HASH = crypto.createHash('sha256').update('').digest('hex');

// Lokales Datum als YYYY-MM-DD (NICHT toISOString/UTC – sonst kann das
// Startdatum in Zeitzonen östlich von UTC einen Tag in die Vergangenheit
// rutschen). Der Build-Container wird auf TZ=Europe/Berlin gesetzt (villa.sh).
function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ISO-8601-UTC ohne Millisekunden, z. B. 2026-04-01T12:00:00Z
function isoTimestamp() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

// HMAC-Header nach Smoobu-Spezifikation. `query` = die zu signierende
// (sortierte) Query-Zeichenkette ohne führendes "?".
function hmacHeaders(query) {
  const timestamp = isoTimestamp();
  const nonce = crypto.randomUUID();
  const canonical = [
    'GET',
    API_PATH,
    query,
    timestamp,
    nonce,
    EMPTY_BODY_HASH,
    API_KEY,
  ].join('\n');
  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(canonical, 'utf8')
    .digest('base64');
  return {
    'X-API-Key': API_KEY,
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
    'X-Signature': signature,
  };
}

async function requestRates(startStr, endStr, ids) {
  // Query-Parameter alphabetisch sortiert
  const pairs = [
    ...ids.map((id) => ['apartments[]', String(id)]),
    ['end_date', endStr],
    ['start_date', startStr],
  ].sort((a, b) =>
    a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0
  );

  const encodedQuery = pairs
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const rawQuery = pairs.map(([k, v]) => `${k}=${v}`).join('&');
  const url = `${API_HOST}${API_PATH}?${encodedQuery}`;

  if (API_SECRET) {
    // Variante A: kodierte Query signieren
    let res = await fetch(url, { headers: hmacHeaders(encodedQuery) });
    // Variante B (Fallback bei 401): dekodierte Query signieren
    if (res.status === 401) {
      res = await fetch(url, { headers: hmacHeaders(rawQuery) });
    }
    return res;
  }
  // Legacy: einzelner Api-Key-Header
  return fetch(url, { headers: { 'Api-Key': API_KEY } });
}

async function fetchPriceData() {
  const fallbackMap = Object.fromEntries(
    apartments.map((a) => [a.slug, a.priceFrom])
  );
  const fallbackVals = Object.values(fallbackMap);
  const fallback = {
    map: fallbackMap,
    min: Math.min(...fallbackVals),
    max: Math.max(...fallbackVals),
  };

  if (!API_KEY) {
    console.warn(
      '[prices] SMOOBU_API_KEY nicht gesetzt – verwende manuelle Preise aus apartments.js.'
    );
    return fallback;
  }

  try {
    const ids = apartments.map((a) => a.smoobuId).filter(Boolean);
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 365);
    const startStr = fmtDate(start);

    const res = await requestRates(startStr, fmtDate(end), ids);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${body.slice(0, 160)}`);
    }

    const json = await res.json();
    const data = json.data || {};
    const map = { ...fallbackMap };
    const debug = {};
    let globalMin = Infinity;
    let globalMax = 0;

    for (const apt of apartments) {
      const byDate = data[apt.smoobuId];
      if (!byDate) continue;
      let min = Infinity;
      let minDate = null;
      let maxForApt = 0;
      for (const [date, day] of Object.entries(byDate)) {
        // Sicherheitsnetz: nur heutige/zukünftige Tage berücksichtigen, falls
        // die API doch mal einen Tag vor dem angefragten Startdatum liefert.
        if (date < startStr) continue;
        const price = day && day.price;
        if (typeof price === 'number' && price > 0) {
          if (price < min) { min = price; minDate = date; }
          if (price > maxForApt) maxForApt = price;
          if (price < globalMin) globalMin = price;
          if (price > globalMax) globalMax = price;
        }
      }
      if (min !== Infinity) {
        map[apt.slug] = Math.round(min);
        debug[apt.slug] = `ab ${Math.round(min)} € (günstigster Tag ${minDate}, teuerster ${Math.round(maxForApt)} €)`;
      }
    }
    console.log('[prices] Details je Wohnung:');
    for (const [slug, info] of Object.entries(debug)) console.log(`  ${slug}: ${info}`);

    const result = {
      map,
      min: globalMin === Infinity ? fallback.min : Math.round(globalMin),
      max: globalMax === 0 ? fallback.max : Math.round(globalMax),
    };
    console.log(
      `[prices] Smoobu-Preise übernommen (${API_SECRET ? 'HMAC' : 'Legacy-Key'}):`,
      JSON.stringify(result)
    );
    return result;
  } catch (e) {
    console.warn(
      `[prices] Smoobu-Abruf fehlgeschlagen (${e.message}) – verwende manuelle Preise.`
    );
    return fallback;
  }
}

// Modul-Singleton: der Abruf läuft nur EINMAL pro Build.
export const priceDataPromise = fetchPriceData();

// slug -> "ab"-Preis (günstigster Tagespreis)
export async function getPriceMap() {
  return (await priceDataPromise).map;
}

// Gesamt-Preisspanne { min, max } für Marketing-Texte
export async function getPriceRange() {
  const d = await priceDataPromise;
  return { min: d.min, max: d.max };
}
