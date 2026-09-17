# MaBaSch

**MaBaSch** ist eine einfache, moderne Inventarlisten-Anwendung: ein Angular-Frontend mit
Angular Material und ein schlankes ASP.NET Core Backend mit SQLite.

![Inventarliste](assets/screenshots/01-inventory-list.png)

## Was kann MaBaSch?

- Artikel anlegen, bearbeiten und löschen
- Volltextsuche über Name, Kategorie und Lagerort
- Filtern nach Kategorie und Sortieren nach Name, Kategorie, Menge oder Preis
- Automatische Warnung, sobald der Bestand eines Artikels den Mindestbestand unterschreitet

## Wie geht's weiter?

<div class="grid cards" markdown>

- :material-rocket-launch:{ .lg .middle } **Erste Schritte**

    ---

    App per Docker oder lokal starten und direkt loslegen.

    [:octicons-arrow-right-24: Erste Schritte](user-guide/getting-started.md)

- :material-format-list-checks:{ .lg .middle } **Funktionen**

    ---

    Alle Funktionen der Anwendung mit Screenshots erklärt.

    [:octicons-arrow-right-24: Funktionen](user-guide/features.md)

- :material-source-branch:{ .lg .middle } **Mitentwickeln**

    ---

    Lokales Entwicklungs-Setup, Architektur und Docker-Details.

    [:octicons-arrow-right-24: Contributing](contributing/development-setup.md)

</div>

## Technologie-Stack

| Bereich  | Technologie                                                             |
| -------- | ------------------------------------------------------------------------ |
| Frontend | Angular 22 (Standalone Components, Signals, Zoneless), Angular Material  |
| Backend  | ASP.NET Core 10 Minimal API, Entity Framework Core                       |
| Datenbank| SQLite                                                                    |
| Betrieb  | Ein einzelnes Docker-Image (Backend liefert das Angular-Build mit aus)   |
