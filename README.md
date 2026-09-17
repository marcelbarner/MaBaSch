# MaBaSch

Einfache, moderne Inventarlisten-Anwendung mit Angular 22 (Frontend) und ASP.NET Core 10
(Backend).

📖 **Vollständige Dokumentation:** https://marcelbarner.github.io/MaBaSch/

## Stack

- **Backend**: ASP.NET Core 10 Minimal API, Entity Framework Core, SQLite
- **Frontend**: Angular 22 (Standalone Components, Signals, Zoneless), Angular Material

## Schnellstart mit Docker

```bash
docker compose up --build
```

Die Anwendung ist danach unter [http://localhost:8080](http://localhost:8080) erreichbar.
Details siehe [Docker-Dokumentation](https://marcelbarner.github.io/MaBaSch/contributing/docker/).

## Lokale Entwicklung

### Backend starten

```bash
cd backend/MaBaSch
dotnet run
```

Läuft standardmäßig auf `http://localhost:5176`. API-Dokumentation unter
`http://localhost:5176/scalar/v1` (nur im Development-Modus). Die SQLite-Datenbank
(`inventory.db`) wird beim ersten Start automatisch erstellt, migriert und mit Beispieldaten
befüllt.

### Frontend starten

```bash
cd frontend/mabasch
npm install
npm start
```

Läuft auf `http://localhost:4200` und leitet Anfragen an `/api/*` per Dev-Proxy an das
Backend weiter (siehe `proxy.conf.json`).

Mehr Details im [Entwicklungs-Setup](https://marcelbarner.github.io/MaBaSch/contributing/development-setup/).

## Funktionsumfang

- Artikel anlegen, bearbeiten, löschen
- Volltextsuche über Name, Kategorie und Lagerort
- Filter nach Kategorie
- Sortierung nach Name, Kategorie, Menge, Preis
- Warnhinweis bei Unterschreitung des Mindestbestands
