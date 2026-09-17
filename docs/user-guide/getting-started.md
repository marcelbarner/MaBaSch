# Erste Schritte

Es gibt zwei Wege, MaBaSch zu starten: per Docker (empfohlen für den schnellen Einstieg) oder
lokal mit .NET- und Node-Tooling (siehe [Entwicklungs-Setup](../contributing/development-setup.md)).

## Mit Docker starten

Voraussetzung ist eine lokale Docker-Installation.

```bash
git clone https://github.com/marcelbarner/MaBaSch.git
cd MaBaSch
docker compose up --build
```

Die Anwendung ist anschließend unter [http://localhost:8080](http://localhost:8080) erreichbar.
Die Datenbank wird automatisch angelegt, migriert und mit Beispieldaten befüllt.

!!! tip "Daten bleiben erhalten"
    `docker-compose.yml` bindet ein benanntes Volume (`mabasch-data`) unter `/app/data` ein.
    Ein `docker compose down` und späteres `docker compose up` verlieren daher keine Daten.
    Nur `docker compose down -v` löscht auch das Volume.

### Ohne docker compose

Alternativ lässt sich das Image auch direkt mit `docker` bauen und starten:

```bash
docker build -t mabasch .
docker run -d --name mabasch -p 8080:8080 -v mabasch-data:/app/data mabasch
```

## Erste Nutzung

1. Öffne [http://localhost:8080](http://localhost:8080) im Browser.
2. Die Inventarliste zeigt bereits zehn Beispielartikel.
3. Über **Neuer Artikel** oben rechts kannst du einen eigenen Artikel anlegen.

Mehr zu den einzelnen Funktionen findest du unter [Funktionen](features.md).
