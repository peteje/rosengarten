# Deployment – Villa Rosengarten

**Variante B:** Der Build läuft **lokal** (mit den Smoobu-Preisen), die fertige
`dist/` wird ins Repo gepusht, und GitHub Actions lädt sie per **FTPS** zu IONOS.
So bleibt der **Smoobu-Key ausschließlich lokal** – bei GitHub liegen nur die
FTP-Zugangsdaten.

Lokal muss **kein Node** installiert sein – alles läuft über Docker.

```
[dein Mac]  ./villa.sh deploy
   │  Build mit Smoobu-Key (lokal)  →  dist/
   │  git push  (Quelle + dist/)
   ▼
[GitHub]  Action lädt dist/ per FTPS hoch
   ▼
[IONOS-Webspace]  live
```

---

## Tägliche Nutzung

```bash
./villa.sh dev                 # Vorschau mit Hot-Reload: http://localhost:4321
./villa.sh build               # nur lokal bauen (Ergebnis in dist/)
./villa.sh deploy "Text ..."   # lokal bauen + committen + pushen -> live
```

Nach `deploy` läuft der Upload automatisch. Fortschritt im GitHub-Repo unter
**Actions**.

---

## Einmalige Einrichtung

### 1. Smoobu-Zugangsdaten lokal ablegen (außerhalb des Repos)
```bash
cp villa-secrets.example.env ~/.villa-secrets.env
# dann ~/.villa-secrets.env öffnen und echte Werte eintragen:
#   SMOOBU_API_KEY=usr_live_...
#   SMOOBU_API_SECRET=...
```
Diese Datei wird nie committet. Ohne sie baut die Seite trotzdem – dann mit den
manuellen Preisen aus `src/data/apartments.js`.

### 2. Skript ausführbar machen
```bash
chmod +x villa.sh
```

### 3. GitHub-Repo (bereits verbunden ✔)
Das Repo liegt unter **`github.com/peteje/rosengarten`** (Remote via HTTPS,
Authentifizierung über den macOS-Schlüsselbund – ohne Passwortabfrage).

### 4. GitHub-Secrets für den IONOS-Upload
Im Repo: **Settings → Secrets and variables → Actions → New repository secret**.
Nur die FTP-Zugangsdaten (kein Smoobu!):

| Secret | Wert |
|---|---|
| `FTP_SERVER` | IONOS-FTP-Server (aus dem IONOS-Kundencenter) |
| `FTP_USERNAME` | IONOS-FTP-Benutzername |
| `FTP_PASSWORD` | IONOS-FTP-Passwort |
| `FTP_SERVER_DIR` | Zielordner auf dem Webspace, **mit Schrägstrich am Ende**. Domain-Wurzel: `./` – oder z. B. `/rosengarten.casa/` |

> Sind es dieselben FTP-Daten wie für die energieteam-fehmarn-Seite, einfach die
> gleichen Werte hier als Repo-Secrets eintragen (Secrets gelten pro Repo) und
> ggf. nur `FTP_SERVER_DIR` auf den Rosengarten-Zielordner setzen.

### 5. Fertig
Ab jetzt genügt `./villa.sh deploy "…"`.

---

## Hinweise

- **Warum liegt `dist/` im Repo?** Weil der Build lokal (mit dem Smoobu-Key)
  passiert und GitHub nur noch hochlädt. Astro vergibt inhaltsbasierte
  Dateinamen – unveränderte Bilder erzeugen keine neuen Dateien, die Historie
  bleibt also überschaubar.
- **Immer `./villa.sh deploy` nutzen** (nicht „nur" `git push`), damit `dist/`
  vor dem Push frisch gebaut wird.
- **Preise aktualisieren**: einfach erneut `./villa.sh deploy` – der Build zieht
  die aktuellen Smoobu-Preise.
- **IONOS-Zugänge**: FTP/FTPS-Benutzer im IONOS-Kundencenter unter
  *Hosting → SFTP/FTP-Zugänge*. IONOS unterstützt FTPS (verschlüsselt).
- **Manuell auslösen**: *Actions → Deploy dist to IONOS → Run workflow*.
