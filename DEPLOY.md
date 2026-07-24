# Deployment – Villa Rosengarten

**Variante B:** Der Build läuft **lokal** (mit den Smoobu-Preisen), die fertige
`dist/` wird ins Repo gepusht, und GitHub Actions lädt sie per **SFTP (lftp
mirror)** zu IONOS. So bleibt der **Smoobu-Key ausschließlich lokal** – bei
GitHub liegen nur die SFTP-Zugangsdaten.

> Der IONOS-Account ist auf reines SFTP beschränkt (rssh, "Allowed commands:
> sftp") – deshalb SFTP/lftp statt rsync-über-SSH.

Lokal muss **kein Node** installiert sein – alles läuft über Docker.

```
[dein Mac]  ./villa.sh deploy
   │  Build mit Smoobu-Key (lokal)  →  dist/
   │  git push  (Quelle + dist/)
   ▼
[GitHub]  Action synct dist/ per SFTP (lftp mirror) hoch
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
Der Upload läuft per **SFTP** (Passwort-Auth, via `lftp mirror`). Im Repo:
**Settings → Secrets and variables → Actions → New repository secret**. Nur
die SFTP-Zugangsdaten (kein Smoobu!):

| Secret | Wert (dient als …) |
|---|---|
| `FTP_SERVER` | IONOS-SFTP-Host |
| `SSL_PORT` | SFTP-Port (meist `22`) |
| `FTP_USERNAME` | IONOS-SFTP-Benutzer |
| `FTP_PASSWORD` | IONOS-SFTP-Passwort |
| `FTP_SERVER_DIR` | Zielordner **relativ zum SFTP-Root** – siehe Warnung unten |

> ⚠️ **Wichtigste Falle: der SFTP-Benutzer ist bei IONOS meist schon auf einen
> bestimmten Ordner eingesperrt (chroot)**, z. B. auf `/rosengarten/`. In dem
> Fall ist `FTP_SERVER_DIR` **relativ zu diesem bereits eingeschränkten Root**
> zu verstehen – der korrekte Wert ist dann einfach **`/`**, NICHT
> `/rosengarten` (das würde nach `/rosengarten/rosengarten/` hochladen, ein
> Pfad, den es nicht gibt → `Permission denied`). Im Zweifel im
> IONOS-Kundencenter unter *Hosting → SFTP-Zugänge* nachsehen, welches
> Verzeichnis dem Benutzer bereits zugeordnet ist.
>
> **Achtung `--delete`:** `mirror` spiegelt `dist/` exakt in `FTP_SERVER_DIR` –
> Dateien im Zielordner, die nicht zur Seite gehören, werden gelöscht.
> `FTP_SERVER_DIR` muss deshalb auf den **eigenen Rosengarten-Ordner** zeigen,
> nicht auf einen gemeinsamen Wurzelordner mit anderen Seiten.

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
- **IONOS-Zugänge**: SFTP-Benutzer im IONOS-Kundencenter unter
  *Hosting → SFTP-Zugänge*.
- **Manuell auslösen**: *Actions → Deploy to IONOS Webspace → Run workflow*.
