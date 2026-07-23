rosengarten.casa – Analyse & Grundgerüst (Stand 21.07.2026)
Analyse der bestehenden Seite
CMS: WordPress + Elementor 4.2.0, Plugin "Real Cookie Banner", Google AdSense.
Inhalte: Startseite, Villa-Story (/story/), 4 Ferienwohnungen (Romantika, Sommerwind, Loft, Zwergenfee), Kontakt, Impressum, Datenschutz, AGB, Kurtaxe.
Buchung/Verfügbarkeit läuft NICHT über WordPress, sondern extern über Smoobu (Domain-Pattern 9a350089.smoobu.net), eingebunden als Link/Widget. Beispiel: https://9a350089.smoobu.net/de/apartment/Romantika/1070464
Preise: ca. 100–260 €/Nacht.
Anforderungen des Nutzers (aus Rückfrage)
Gewünschte Funktionen neue Seite: Verfügbarkeitskalender + Online-Buchung & Zahlung.
Pflege der Inhalte: durch den Nutzer selbst, Code-Bearbeitung ist kein Problem.
Hosting: IONOS-Webspace (klassisches Shared-Hosting, PHP 8.2 + MySQL, SFTP/SSH, kein Node.js). Bestätigt geeignet, da Astro nur statische Dateien erzeugt.
Empfehlung

Da Smoobu die Buchungsfunktion ohnehin unabhängig vom CMS bereitstellt (Widget/iframe, funktioniert auf jeder HTML-Seite), verliert man beim Verzicht auf WordPress/Elementor keine Funktionalität. Empfehlung: statischer Seitengenerator Astro (Alternative: Eleventy/11ty). Vorteile: schneller, sicherer (keine Plugin-Updates), günstiger/kostenlos hostbar (Netlify, Vercel, GitHub Pages, IONOS-Webspace), volle Code-Kontrolle.

Grundgerüst (geliefert, Stand: 2 Versionen an Nutzer gesendet)

Astro-Projekt rosengarten-astro.zip an Nutzer gesendet, zuletzt file_uuid d1e5ca7f-1722-45c4-b7a9-0414d29f9e7e, mit:

Layout, Header/Footer, Cookie-Banner-Komponente, Smoobu-Buchungsbox-Komponente.
Datengetriebene Apartment-Seiten (src/data/apartments.js → automatische Detailseiten unter /<slug>/).
Seiten: Startseite, Villa, Ferienwohnungen-Übersicht, 4 Apartment-Detailseiten, Kontakt, Danke-Seite (/kontakt/danke/), 404-Seite, Impressum/Datenschutz/AGB/Kurtaxe (Platzhalter, Originaltexte der alten Seite müssen 1:1 übernommen werden).
Kontaktformular-Backend: public/contact.php – eigenes PHP-mail()-Skript (statt Formspree), läuft direkt im IONOS-Webspace ohne Drittanbieter. Enthält Honeypot-Spamschutz, Validierung, Header-Injection-Schutz. TODO vor Live-Gang: $to/$from in contact.php eintragen.
public/.htaccess: Security-Header für IONOS/Apache (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS, HTTPS-Erzwingung, eigene 404-Seite, Directory-Listing aus). CSP erlaubt aktuell self + Smoobu-iframe + Google Maps/YouTube-Embed-Domains; muss ergänzt werden, falls später weitere Dienste (Analytics, AdSense) eingebunden werden.
README.md mit Setup-Anleitung, offenen TODOs, Hosting-Empfehlung und eigenem Abschnitt "Deployment auf IONOS-Webspace" (SFTP-Upload von dist/, inkl. .htaccess, Domain-Zuordnung im IONOS-Kundencenter).

Wichtiger Hinweis: npm install/Build konnte in dieser Sandbox-Session NICHT verifiziert werden – der npm-Registry-Zugriff (registry.npmjs.org) ist im Netzwerk-Egress dieser Session blockiert ("Host not in allowlist"). Der Code folgt Standard-Astro-Konventionen (Version ^4.16.0), PHP-Syntax von contact.php wurde lokal mit php -l geprüft (fehlerfrei). Trotzdem sollte der Nutzer npm install && npm run dev lokal ausführen, um den Build zu verifizieren.

Offene nächste Schritte
Echte Texte/Fotos einpflegen (aktuell Platzhalter).
Rechtstexte 1:1 von der alten Seite übernehmen.
$to/$from in public/contact.php eintragen.
Smoobu-Embed-Snippet (aus Smoobu-Dashboard) für Inline-Kalender einsetzen statt nur Link-Button.
Domain rosengarten.casa im IONOS-Kundencenter dem Webspace-Paket zuordnen (DNS-Umstellung falls Domain woanders registriert ist).
Nach Upload testen: Formular-Versand, HTTPS-Redirect, Security-Header (z. B. mit securityheaders.com prüfen).
