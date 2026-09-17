# Inventarverwaltung

Einfache Inventarlisten-Anwendung mit Angular 22 (Frontend) und ASP.NET Core 10 (Backend).

## Stack

- **Backend**: ASP.NET Core 10 Minimal API, Entity Framework Core, SQLite
- **Frontend**: Angular 22 (Standalone Components, Signals, Zoneless), Angular Material

## Backend starten

```bash
cd backend/InventoryApi
dotnet run
```

Läuft standardmäßig auf `http://localhost:5176`. API-Dokumentation unter `http://localhost:5176/scalar/v1` (nur im Development-Modus). Die SQLite-Datenbank (`inventory.db`) wird beim ersten Start automatisch erstellt, migriert und mit Beispieldaten befüllt.

## Frontend starten

```bash
cd frontend/inventory-app
npm install
npm start
```

Läuft auf `http://localhost:4200` und leitet Anfragen an `/api/*` per Dev-Proxy an das Backend weiter (siehe `proxy.conf.json`).

## Funktionsumfang

- Artikel anlegen, bearbeiten, löschen
- Volltextsuche über Name, Kategorie und Lagerort
- Filter nach Kategorie
- Sortierung nach Name, Kategorie, Menge, Preis
- Warnhinweis bei Unterschreitung des Mindestbestands
