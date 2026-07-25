// Holt Google-Bewertungen zur BUILD-ZEIT über die offizielle Places API (New)
// und backt sie fest in die statischen Seiten. Kein Client-Skript, kein
// Tracker, keine Erweiterung der Datenschutzerklärung nötig.
//
// Booking.com und Airbnb bieten keine öffentliche Bewertungs-API (Stand 2026,
// auch nicht für zertifizierte Software-Partner) – deshalb werden diese
// beiden Quellen stattdessen aus einer handgepflegten Markdown-Datei
// gelesen: _originale/bewertungen.md (liegt außerhalb des Repos, siehe
// _originale/.gitignore-Regel für den ganzen Ordner).
//
// Build mit Google-Bewertungen (Key + Place-ID als Umgebungsvariablen):
//   docker run --rm -e GOOGLE_PLACES_API_KEY="…" -e GOOGLE_PLACE_ID="…" \
//     -v "$PWD":/app -w /app node:22-alpine sh -c "npm run build"
//
// Ohne gesetzte Werte (oder bei Fehler) wird die Google-Quelle einfach
// übersprungen – der Build schlägt nie fehl.
//
// Bewertungsfotos: optional unter _originale/bewertungsphotos_web/ ablegen,
// Dateiname = Gästename (z.B. "Hans-Dieter.jpg") -> wird automatisch der
// gleichnamigen Bewertung (Google/Booking/Airbnb) zugeordnet und nach
// public/bewertungsfotos/ kopiert.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.GOOGLE_PLACE_ID;

// Für den Namensabgleich zwischen Bewertung und Fotodatei: Klein-/Groß-
// schreibung, Umlaute/Akzente und Sonderzeichen/Leerzeichen ignorieren.
const normalizeName = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

// Schreibt eine Bewertungsfoto-Datei sowohl nach public/bewertungsfotos/
// (versionierte Quelle, für den nächsten Build) als auch – falls der Ordner
// zum Zeitpunkt des Aufrufs schon existiert – direkt nach dist/bewertungsfotos/.
// Grund: Astro kopiert public/ an den ANFANG des Builds nach dist/, dieser
// Code läuft aber erst während der Seiten-Generierung (SSG) danach – ohne den
// direkten dist-Schreibvorgang würden neu geladene Fotos erst im
// übernächsten Build im Deploy landen.
function writePhotoFile(destName, buffer) {
  const publicDir = path.resolve('public/bewertungsfotos');
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, destName), buffer);

  const distDir = path.resolve('dist/bewertungsfotos');
  if (fs.existsSync(path.resolve('dist'))) {
    fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(path.join(distDir, destName), buffer);
  }
}

// Manuell bereitgestellte Bewertungsfotos: liegen unter
// _originale/bewertungsphotos_web/, Dateiname = Gästename (z.B. "Hans-Dieter.jpg").
// Werden nach public/bewertungsfotos/ kopiert und per Name der jeweiligen
// Bewertung (Google, Booking, Airbnb) zugeordnet.
function loadManualPhotoMap() {
  const dir = path.resolve('_originale/bewertungsphotos_web');
  const map = new Map();
  if (!fs.existsSync(dir)) return map;

  for (const file of fs.readdirSync(dir)) {
    if (!/\.(jpe?g|png|webp|avif)$/i.test(file)) continue;
    const key = normalizeName(path.parse(file).name);
    const destName = `manual-${key}${path.extname(file).toLowerCase()}`;
    writePhotoFile(destName, fs.readFileSync(path.join(dir, file)));
    map.set(key, `/bewertungsfotos/${destName}`);
  }
  return map;
}

// Lädt ein von einem Gast bei Google hochgeladenes Ortsfoto herunter und
// speichert es lokal unter public/bewertungsfotos/ (fester, vom Foto-Namen
// abgeleiteter Dateiname -> stabil über mehrere Builds hinweg, kein Wildwuchs).
// Der API-Key bleibt dabei serverseitig; im HTML landet nur der lokale Pfad.
async function downloadReviewPhoto(photoName) {
  try {
    const mediaRes = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=600&skipHttpRedirect=true&key=${API_KEY}`
    );
    if (!mediaRes.ok) throw new Error(`HTTP ${mediaRes.status}`);
    const { photoUri } = await mediaRes.json();
    if (!photoUri) return null;

    const imgRes = await fetch(photoUri);
    if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    const hash = crypto.createHash('sha1').update(photoName).digest('hex').slice(0, 16);
    writePhotoFile(`${hash}.jpg`, buffer);
    return `/bewertungsfotos/${hash}.jpg`;
  } catch (e) {
    console.warn(`[reviews] Bewertungsfoto-Download fehlgeschlagen (${e.message}).`);
    return null;
  }
}

async function fetchGoogleReviews() {
  if (!API_KEY || !PLACE_ID) {
    console.warn(
      '[reviews] GOOGLE_PLACES_API_KEY/GOOGLE_PLACE_ID nicht gesetzt – keine Google-Bewertungen im Build.'
    );
    return { reviews: [], rating: null, count: null, mapsUri: null };
  }

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=de`,
      {
        headers: {
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask':
            'rating,userRatingCount,googleMapsUri,reviews.rating,reviews.text,reviews.originalText,reviews.authorAttribution,reviews.publishTime,reviews.relativePublishTimeDescription,photos.name,photos.authorAttributions',
        },
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const reviews = (data.reviews || []).map((r) => ({
      source: 'google',
      name: r.authorAttribution?.displayName || 'Google-Nutzer',
      photoUri: r.authorAttribution?.photoUri || null,
      photoUrl: null, // ggf. unten mit einem von diesem Gast hochgeladenen Ortsfoto befüllt
      rating: r.rating,
      ratingMax: 5,
      // Original-Text bevorzugen (echter Gästetext), sonst übersetzten Text.
      text: r.originalText?.text || r.text?.text || '',
      date: r.relativePublishTimeDescription || '',
      profileUrl: data.googleMapsUri || null,
    }));

    // Google liefert Reviewer-Fotos nicht direkt am Review, sondern separat
    // als Ortsfotos mit Autor-Attribution -> per Name der Bewertung zuordnen
    // (so wie Google es selbst in seiner eigenen Bewertungsansicht macht).
    const placePhotos = data.photos || [];
    if (placePhotos.length && reviews.length) {
      for (const r of reviews) {
        const match = placePhotos.find((p) =>
          (p.authorAttributions || []).some(
            (a) => a.displayName?.trim().toLowerCase() === r.name.trim().toLowerCase()
          )
        );
        if (match) r.photoUrl = await downloadReviewPhoto(match.name);
      }
    }

    console.log(
      `[reviews] Google: ${reviews.length} Bewertungen übernommen (Gesamt ${data.rating}★, ${data.userRatingCount} Bewertungen).`
    );

    return {
      reviews,
      rating: data.rating ?? null,
      count: data.userRatingCount ?? null,
      mapsUri: data.googleMapsUri ?? null,
    };
  } catch (e) {
    console.warn(`[reviews] Google-Abruf fehlgeschlagen (${e.message}).`);
    return { reviews: [], rating: null, count: null, mapsUri: null };
  }
}

// Liest _originale/bewertungen.md, Format:
//
// ## Booking.com
// Profil-Link: https://…
//
// - Name: Sarah M.
//   Bewertung: 9.5/10
//   Datum: Juli 2026
//   Text: "…"
// Robust gegenüber Tippfehlern (z.B. "Bwertung" statt "Bewertung"), fehlenden
// Leerzeichen ("-Name:" statt "- Name:") und mehrzeiligen Text-Werten (eine
// Bewertung darf über mehrere Zeilen gehen, bis das nächste Feld beginnt).
function parseManualReviews() {
  const file = path.resolve('_originale/bewertungen.md');
  if (!fs.existsSync(file)) return [];

  const content = fs.readFileSync(file, 'utf-8');
  const result = [];
  let currentSource = null;
  let currentProfileUrl = null;
  let currentEntry = null;
  let collectingText = false;

  const stripQuotes = (s) => s.trim().replace(/^"+/, '').replace(/"+$/, '').trim();

  const flush = () => {
    if (currentEntry && currentEntry.name && currentEntry.text) {
      currentEntry.text = stripQuotes(currentEntry.text);
      result.push({
        source: currentSource,
        profileUrl: currentProfileUrl,
        ...currentEntry,
      });
    }
    currentEntry = null;
    collectingText = false;
  };

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();

    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      flush();
      const label = heading[1].toLowerCase();
      currentSource = label.includes('airbnb')
        ? 'airbnb'
        : label.includes('booking')
          ? 'booking'
          : label;
      currentProfileUrl = null;
      continue;
    }

    const profile = line.match(/^Profil-Link:?\s*(.+)/i);
    if (profile) {
      currentProfileUrl = profile[1].trim();
      collectingText = false;
      continue;
    }

    // "- Name: X", "-Name: X", "- Name:X" – Bindestrich/Leerzeichen optional.
    const name = line.match(/^-\s*Name:?\s*(.*)/i);
    if (name) {
      flush();
      currentEntry = { name: name[1].trim(), text: '' };
      collectingText = false;
      continue;
    }

    if (!currentEntry) continue;

    // "Bewertung" / Tippfehler "Bwertung", Doppelpunkt optional.
    const rating = line.match(/^B[e]?wertung:?\s*(.+)/i);
    if (rating) {
      currentEntry.ratingLabel = rating[1].trim();
      collectingText = false;
      continue;
    }
    const date = line.match(/^Datum:?\s*(.+)/i);
    if (date) {
      currentEntry.date = date[1].trim();
      collectingText = false;
      continue;
    }
    const text = line.match(/^Text:?\s*(.*)/i);
    if (text) {
      currentEntry.text = text[1];
      collectingText = true;
      continue;
    }
    // Fortsetzungszeile eines mehrzeiligen Textes.
    if (collectingText && line) {
      currentEntry.text += ' ' + line;
    }
  }
  flush();

  if (result.length) {
    console.log(`[reviews] ${result.length} manuelle Bewertungen aus bewertungen.md übernommen.`);
  }
  return result;
}

async function loadReviewData() {
  const google = await fetchGoogleReviews();
  const manual = parseManualReviews();
  const all = [...google.reviews, ...manual];

  const manualPhotos = loadManualPhotoMap();
  if (manualPhotos.size) {
    let matched = 0;
    for (const r of all) {
      if (!r.photoUrl) {
        const photo = manualPhotos.get(normalizeName(r.name));
        if (photo) {
          r.photoUrl = photo;
          matched++;
        }
      }
    }
    console.log(`[reviews] ${matched}/${manualPhotos.size} manuelle Bewertungsfotos zugeordnet.`);
  }

  return { google, manual, all };
}

export const reviewDataPromise = loadReviewData();

export async function getReviews() {
  return reviewDataPromise;
}
