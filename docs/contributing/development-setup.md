# Entwicklungs-Setup

## Voraussetzungen

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 22 oder neuer
- [Angular CLI](https://angular.dev/tools/cli) 22.1.4 (`npm install -g @angular/cli@22.1.4`)
- Optional: [Docker](https://www.docker.com/) für den Container-Betrieb

## Repository klonen

```bash
git clone https://github.com/marcelbarner/MaBaSch.git
cd MaBaSch
```

## Backend starten

```bash
cd backend/MaBaSch
dotnet run
```

Das Backend läuft auf `http://localhost:5176`. Beim ersten Start wird die SQLite-Datenbank
(`inventory.db`) automatisch erstellt, migriert und mit Beispieldaten befüllt. Die
interaktive API-Dokumentation (Scalar) ist im Development-Modus unter
`http://localhost:5176/scalar/v1` erreichbar.

## Frontend starten

```bash
cd frontend/mabasch
npm install
npm start
```

Das Frontend läuft auf `http://localhost:4200` und leitet Anfragen an `/api/*` über den
Dev-Proxy (`proxy.conf.json`) an das Backend weiter.

## Tests ausführen

```bash
# Backend (TUnit) — bewusst `dotnet run`, nicht `dotnet test`:
# TUnit-Projekte sind ausführbare Microsoft.Testing.Platform-Programme; `dotnet test`
# erfordert unter .NET 10 ein separates Opt-in, das hier nicht eingerichtet ist.
cd backend/MaBaSch.Tests
dotnet run

# Frontend (Vitest)
cd frontend/mabasch
npm test
```

## EF-Core-Migrationen

Neue Migration nach Änderungen am Datenmodell erzeugen:

```bash
cd backend/MaBaSch
dotnet ef migrations add <Name>
```

Das `dotnet-ef`-Tool muss dafür global installiert sein (`dotnet tool install --global dotnet-ef`).

## Screenshots für die Dokumentation aktualisieren

Wenn sich das UI ändert, sollten auch die Screenshots in `docs/assets/screenshots`
aktualisiert werden:

```bash
cd scripts
npm install
BASE_URL=http://localhost:8080 npm run screenshots
```

Das Skript erwartet eine laufende Instanz der Anwendung (z. B. den Docker-Container) unter
`BASE_URL` und speichert die Screenshots direkt in `docs/assets/screenshots`.
