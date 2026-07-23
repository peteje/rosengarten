# Villa Rosengarten – Website-Grundgerüst (Astro, ohne WordPress)

Statisches Grundgerüst als Ersatz für die bisherige WordPress/Elementor-Seite.
Die Verfügbarkeits-/Buchungsfunktion läuft weiterhin über **Smoobu** – das
war auch auf der alten Seite schon ein externer Dienst und funktioniert
unabhängig vom CMS.

## Struktur

```
src/
  data/apartments.js      Alle Wohnungen an einer Stelle pflegen
                           (Name, Preis, Beschreibung, Smoobu-Link).
                           Neue Wohnung = neuer Eintrag → Seite entsteht automatisch.
  components/              Wiederverwendbare Bausteine (Header, Footer,
                           Apartment-Karte, Cookie-Banner, Smoobu-Buchungsbox).
  layouts/Layout.astro     Gemeinsames HTML-Grundgerüst (Kopf, Header, Footer).
  pages/                   Eine Datei = eine URL.
    index.astro            /
    villa/                 /villa/
    ferienwohnungen/       /ferienwohnungen/  (Übersicht)
    [slug]/index.astro     /romantika/, /sommerwind/, /loft/, /zwergenfee/
                           (wird automatisch aus apartments.js erzeugt)
    kontakt/                /kontakt/
    impressum/, datenschutz/, agb/, kurtaxe/
public/
  images/                  Eigene Fotos hier ablegen (siehe unten).
  favicon.svg
  contact.php              Backend fürs Kontaktformular (PHP mail(), läuft im
                           IONOS-Webspace). Landet 1:1 im Webspace-Root.
  .htaccess                Security-Header, HTTPS-Erzwingung, 404-Seite
                           (Apache-Konfiguration für IONOS-Webspace).
```

## Lokal starten

```bash
npm install
npm run dev
```
Seite läuft dann unter http://localhost:4321

## Produktions-Build erzeugen

```bash
npm run build
```
Ergebnis liegt in `dist/` – das sind reine HTML/CSS/JS-Dateien, die auf
jedem Webspace funktionieren (kein PHP, keine Datenbank nötig).

## Was noch zu tun ist (Platzhalter ersetzen)

1. **Texte**: Alle "Platzhaltertext"-Stellen durch echte Inhalte ersetzen
   (Startseite, Villa-Story, Apartment-Beschreibungen in `src/data/apartments.js`).
2. **Rechtstexte**: Impressum, Datenschutz, AGB, Kurtaxe von der bestehenden
   Seite 1:1 übernehmen (rechtlich nichts frei erfinden lassen).
3. **Fotos**: Dateien in `public/images/` ablegen (z. B. `romantika-1.jpg`)
   und die `card-image-placeholder`-Divs durch `<img>`-Tags ersetzen.
4. **Kontaktformular**: Läuft über `public/contact.php` (PHP `mail()`,
   funktioniert direkt im IONOS-Webspace). In `contact.php` unbedingt
   `$to` (Empfänger) und `$from` (Absender der eigenen Domain) eintragen,
   bevor die Seite live geht. Nur relevant, falls die Seite mal auf einem
   Host ohne PHP läuft (z. B. Netlify): dann stattdessen
   [Formspree](https://formspree.io) o. Ä. verwenden.
5. **Smoobu-Widget**: Aktuell verlinkt der Buchungs-Button nur auf die
   Smoobu-Buchungsseite. Für einen Kalender direkt auf der eigenen Seite:
   im Smoobu-Dashboard unter "Online-Buchungstool → Einbinden" das
   iframe/Javascript-Snippet kopieren und in
   `src/components/SmoobuBooking.astro` einsetzen.
6. **Google Maps**: Karten-Einbettung (iframe) auf der Startseite ergänzen
   (Google Maps → Teilen → "Karte einbetten").
7. **Cookie-Banner**: Nur nötig, falls Tracking/Marketing-Skripte (Analytics,
   AdSense o. Ä.) eingesetzt werden. Ohne solche Skripte kann der Banner
   in `src/components/CookieBanner.astro` auch entfallen.

## Hosting-Empfehlung

Statische Seiten lassen sich sehr günstig bzw. kostenlos hosten, z. B.:

- **Netlify** oder **Vercel**: `npm run build`, Repo verbinden, automatisches
  Deployment bei jedem Push. Kostenlos für diese Seitengröße. (Kontaktformular
  dann über Netlify Forms/Formspree statt `contact.php`, da kein PHP läuft.)
- **GitHub Pages**: ebenfalls kostenlos, etwas mehr manuelle Konfiguration.
- **IONOS-Webspace** (klassisches Shared-Hosting): siehe eigener Abschnitt unten.

Die bestehende Domain `rosengarten.casa` lässt sich unabhängig vom Hoster
per DNS auf den neuen Anbieter umstellen.

### Deployment auf IONOS-Webspace

IONOS-Webspace hat keine Node.js-Laufzeit – das ist hier egal, weil Astro
den Build lokal erzeugt und nur fertige statische Dateien hochgeladen
werden. PHP und SFTP sind in jedem IONOS-Webspace-Tarif enthalten, das
reicht komplett aus.

1. `npm run build` ausführen → Ergebnis liegt in `dist/`.
2. Kompletten Inhalt von `dist/` (inkl. der unsichtbaren Datei `.htaccess`!)
   per SFTP (Zugangsdaten aus dem IONOS-Kundencenter, z. B. mit FileZilla)
   in das Webspace-Root-Verzeichnis hochladen. Im FTP-Client unbedingt
   "versteckte Dateien anzeigen" aktivieren, sonst wird die `.htaccess`
   nicht mit hochgeladen.
3. In `public/contact.php` vor dem ersten Deploy `$to` und `$from`
   eintragen (siehe Kommentare in der Datei).
4. Domain `rosengarten.casa` im IONOS-Kundencenter dem Webspace-Paket
   zuordnen (falls die Domain schon bei IONOS liegt: wenige Klicks; falls
   sie woanders registriert ist: DNS/Nameserver auf IONOS umstellen oder
   Domain dorthin transferieren).
5. Da `trailingSlash: 'always'` gesetzt ist, erzeugt der Build für jede
   Seite einen Ordner mit `index.html` (z. B. `dist/romantika/index.html`) –
   Apache liefert das automatisch als Startdokument aus, ohne weitere
   Konfiguration nötig.

Die mitgelieferte `.htaccess` erzwingt HTTPS, setzt gängige
Security-Header (u. a. Content-Security-Policy, X-Frame-Options, HSTS,
Referrer-Policy) und bindet eine eigene 404-Seite ein. Falls später weitere
externe Dienste eingebunden werden (z. B. Google Analytics, AdSense,
weitere Embeds), müssen deren Domains in der `Content-Security-Policy`
in `.htaccess` ergänzt werden – sonst blockiert der Browser sie
kommentarlos.

## Warum kein WordPress/Elementor?

Die alte Seite nutzte WordPress/Elementor nur für Layout und Inhalte –
die eigentliche Buchungsfunktion (Kalender, Verfügbarkeit, Zahlung) kam
schon vorher von Smoobu als externem Widget. Da die Inhalte größtenteils
statisch sind (Texte, Fotos, Preise) und kein CMS-Backend für Redakteure
ohne Code-Kenntnisse benötigt wird, bringt eine statische Seite Vorteile:
deutlich schnellere Ladezeiten, kein Update-/Plugin-Sicherheitsaufwand,
günstigeres Hosting, volle Kontrolle über den Code.
