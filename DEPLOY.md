# Deployment – Villa Rosengarten

Ablauf: **`./villa.sh deploy` → Push nach GitHub → GitHub Actions baut (mit
Smoobu-Preisen) → automatischer FTPS-Upload zum IONOS-Webspace.**

Lokal muss **kein Node** installiert sein – alles läuft über Docker.

---

## Tägliche Nutzung

```bash
./villa.sh dev                 # Vorschau mit Hot-Reload: http://localhost:4321
./villa.sh build               # Nur lokal bauen (Ergebnis in dist/)
./villa.sh deploy "Text ..."   # bauen + committen + nach GitHub pushen -> live
```

Nach `deploy` läuft der Rest automatisch. Fortschritt im GitHub-Repo unter
**Actions**.

---

## Einmalige Einrichtung

### 1. Skript ausführbar machen
```bash
chmod +x villa.sh
```

### 2. GitHub-Repo anlegen & verbinden
Repo auf github.com anlegen (leer, ohne README), dann hier:
```bash
git add -A
git commit -m "Initialer Stand"
git branch -M main
git remote add origin https://github.com/<DEIN-KONTO>/rosengarten-astro.git
git push -u origin main
```
(Ohne installiertes `gh` einfach über die GitHub-Weboberfläche „New repository".)

### 3. GitHub-Secrets setzen
Im Repo: **Settings → Secrets and variables → Actions → New repository secret**.
Diese sechs Secrets anlegen:

| Secret | Wert |
|---|---|
| `SMOOBU_API_KEY` | Smoobu-API-Key (beginnt mit `usr_…`) |
| `SMOOBU_API_SECRET` | Smoobu-Secret („Verschlüsselung") |
| `FTP_SERVER` | IONOS-FTP-Server (aus dem IONOS-Kundencenter, z. B. `access-XXXX.webspace-host.com`) |
| `FTP_USERNAME` | IONOS-FTP-Benutzername |
| `FTP_PASSWORD` | IONOS-FTP-Passwort |
| `FTP_SERVER_DIR` | Zielordner auf dem Webspace, **mit Schrägstrich am Ende**. Für die Domain-Wurzel: `./` – oder z. B. `/rosengarten.casa/` |

> Die Smoobu-Zugangsdaten liegen damit **nur** verschlüsselt bei GitHub, nie im
> Code. Fehlen sie, baut die Seite trotzdem – dann mit den manuellen Preisen aus
> `src/data/apartments.js`.

### 4. Fertig
Ab jetzt genügt `./villa.sh deploy "…"`. Der erste Lauf legt auf dem Webspace
eine kleine Sync-Statusdatei an; danach werden nur noch geänderte Dateien
hochgeladen (inkl. `.htaccess` und `contact.php`).

---

## Hinweise

- **IONOS-Zugangsdaten**: FTP/FTPS-Benutzer im IONOS-Kundencenter unter
  *Hosting → SFTP/FTP-Zugänge* anlegen/ansehen. IONOS unterstützt **FTPS**
  (verschlüsselt) – genau das nutzt die Pipeline.
- **Domain-Zuordnung**: Die Domain `rosengarten.casa` muss im IONOS-Kundencenter
  auf das Webspace-Paket bzw. den Zielordner (`FTP_SERVER_DIR`) zeigen.
- **Preise aktualisieren**: Einfach erneut `./villa.sh deploy` – der Build zieht
  die aktuellen Smoobu-Preise neu.
- **Manuell auslösen**: Im Repo unter *Actions → Build & Deploy to IONOS →
  Run workflow* lässt sich ein Deploy auch ohne Code-Änderung starten.
