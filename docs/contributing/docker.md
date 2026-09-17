# Docker

MaBaSch läuft als **ein einzelner Container**: Das ASP.NET Core Backend liefert zusätzlich zur
API auch die kompilierten Angular-Static-Files aus. Ein separater Webserver (z. B. Nginx) ist
nicht nötig.

## Build

Das `Dockerfile` im Repo-Root ist ein Multi-Stage-Build mit drei Stages:

1. **`frontend-build`** (`node:22-alpine`): installiert die npm-Abhängigkeiten von
   `frontend/mabasch` und baut das Produktions-Bundle (`npm run build`).
2. **`backend-build`** (`mcr.microsoft.com/dotnet/sdk:10.0`): restored und published das
   Backend (`dotnet publish -c Release`).
3. **`final`** (`mcr.microsoft.com/dotnet/aspnet:10.0`): kombiniert beide Build-Ergebnisse —
   das Backend-Publish-Output sowie das Angular-Bundle unter `wwwroot/`.

```bash
docker build -t mabasch .
```

## Ausführen

```bash
docker run -d --name mabasch \
  -p 8080:8080 \
  -v mabasch-data:/app/data \
  mabasch
```

Die Anwendung ist danach unter `http://localhost:8080` erreichbar.

Komfortabler geht es mit `docker compose`:

```bash
docker compose up --build
```

## Konfiguration

| Umgebungsvariable            | Standardwert (im Image)                | Zweck                                   |
| ----------------------------- | --------------------------------------- | ---------------------------------------- |
| `ASPNETCORE_URLS`              | `http://+:8080`                          | Port/Bindung des Kestrel-Servers          |
| `ASPNETCORE_ENVIRONMENT`       | `Production`                             | Steuert z. B. ob Scalar/OpenAPI aktiv ist |
| `ConnectionStrings__Default`   | `Data Source=/app/data/mabasch.db`       | SQLite-Verbindungsstring                  |

## Persistenz

Die SQLite-Datenbank liegt im Container unter `/app/data/mabasch.db`. Dieser Pfad ist als
Docker-Volume deklariert (`VOLUME ["/app/data"]`), damit die Daten einen Container-Neustart
oder ein Image-Update überleben, solange dasselbe Volume wiederverwendet wird.

```bash
# Daten sichern
docker run --rm -v mabasch-data:/data -v "$PWD":/backup alpine \
  tar czf /backup/mabasch-data-backup.tar.gz -C /data .
```

## SPA-Routing im Container

Damit clientseitiges Routing (z. B. `/inventory`) auch bei einem direkten Aufruf oder Reload
funktioniert, registriert das Backend einen Fallback auf `index.html`:

```csharp
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");
```

Alle Routen, die nicht auf `/api/*` passen, liefern damit die Angular-`index.html` aus, sodass
der Angular-Router die weitere Navigation übernehmen kann.
