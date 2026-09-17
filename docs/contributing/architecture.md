# Architektur

## Überblick

```
repo/
├── backend/MaBaSch/       ASP.NET Core 10 Minimal API
├── frontend/mabasch/      Angular 22 Anwendung
├── docs/                  Diese Dokumentation (MkDocs Material)
├── scripts/                Hilfsskripte (u. a. Screenshot-Generierung)
├── Dockerfile              Multi-Stage-Build für Frontend + Backend
└── docker-compose.yml      Komfort-Setup für den Container-Betrieb
```

## Backend (`backend/MaBaSch`)

Das Backend ist eine ASP.NET Core Minimal API ohne Controller-Boilerplate.

```
MaBaSch/
├── Program.cs              Composition Root: DI, Middleware, Endpoint-Mapping
├── Models/                 EF-Core-Entities (InventoryItem)
├── Dtos/                   Request-/Response-DTOs inkl. DataAnnotations-Validierung
├── Data/                   DbContext + Seed-Daten
├── Services/               Business-Logik (Suche, Filter, Sortierung), von Endpoints entkoppelt
├── Endpoints/               Minimal-API-Endpoint-Gruppen + Validation-Filter
└── Migrations/              EF-Core-Migrationen
```

Wichtige Designentscheidungen:

- **Service-Layer-Trennung**: `IInventoryService`/`InventoryService` kapseln die Business-Logik
  getrennt von den HTTP-Endpoints — leichter zu testen und wiederzuverwenden.
- **Validierung als Endpoint-Filter**: `ValidationFilter<T>` führt DataAnnotations-Validierung
  explizit aus, da Minimal APIs das nicht automatisch tun.
- **SPA-Hosting**: Im Produktions-Build liefert das Backend das kompilierte Angular-Bundle aus
  `wwwroot/` aus (`UseStaticFiles` + `MapFallbackToFile`), sodass ein einzelner Prozess reicht.

## Frontend (`frontend/mabasch`)

Angular-Anwendung mit Standalone Components, Signals und Zoneless Change Detection (kein
`zone.js`).

```
src/app/
├── core/
│   ├── models/              TypeScript-Interfaces (InventoryItem, InventoryQuery, ...)
│   └── services/            InventoryService (HttpClient-Wrapper)
├── features/inventory/
│   ├── inventory-list/      Hauptkomponente: Tabelle, Suche, Filter, Sortierung
│   ├── inventory-form/      Dialog für Anlegen/Bearbeiten (Reactive Forms)
│   └── inventory-delete-dialog/  Lösch-Bestätigungsdialog
├── app.config.ts             Provider-Setup (HttpClient, Router, Animations, Material)
└── app.routes.ts              Routing (Lazy-Loading der Inventory-Feature-Komponente)
```

Wichtige Designentscheidungen:

- **Standalone statt NgModules**: jede Komponente deklariert ihre Imports selbst.
- **Signals statt RxJS-State-Management**: einfacher lokaler State über `signal`/`computed`.
- **Angular Material (M3-Theme)**: konsistentes, modernes Design ohne eigenes Design-System.
- **Lazy-Loading**: die Inventory-Feature-Komponente wird über `loadComponent` nachgeladen.

## Kommunikation Frontend ↔ Backend

Im Entwicklungsbetrieb laufen Frontend und Backend als getrennte Prozesse; der Angular
Dev-Server leitet `/api/*`-Anfragen per `proxy.conf.json` an das Backend weiter.

Im Docker-Image entfällt der Proxy: das Backend liefert sowohl die API unter `/api/*` als
auch die statischen Angular-Dateien unter `/` aus demselben Origin aus — siehe
[Docker](docker.md).
