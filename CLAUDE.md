# MaBaSch — Projekt- und Workflow-Guide für Claude Code

MaBaSch ist eine einfache Inventarlisten-Anwendung. Dieses Dokument beschreibt den
verbindlichen Arbeitsablauf für jede Feature-/Bugfix-Anfrage in diesem Repository sowie
den festgelegten Tech-Stack.

## Tech-Stack (festgelegt, nicht zur Diskussion)

| Bereich  | Technologie |
| -------- | ----------- |
| Backend  | ASP.NET Core 10, Minimal API, Entity Framework Core, SQLite |
| Frontend | Angular 22, Standalone Components, Signals, Zoneless, Angular Material |
| Backend-Tests | **TUnit** (`backend/MaBaSch.Tests`) |
| Backend-E2E/Integration (bei Bedarf) | **Playwright für .NET** (`Microsoft.Playwright` / `TUnit.Playwright`) |
| Frontend-Tests | **Vitest** (`@angular/build:unit-test`) |
| Betrieb | Ein Docker-Image (Backend liefert das Angular-Build aus `wwwroot/` mit aus) |
| Doku | MkDocs Material, deployed nach GitHub Pages |

## Repository-Struktur

```
backend/MaBaSch/          ASP.NET Core Backend
backend/MaBaSch.Tests/    TUnit-Testprojekt
frontend/mabasch/         Angular-Frontend
docs/                     MkDocs-Dokumentation (User Guide + Contributing)
scripts/                  Hilfsskripte (u.a. Playwright-Screenshot-Generator)
.claude/agents/           Rollen-Agenten für den Team-Workflow (siehe unten)
Dockerfile, docker-compose.yml   Ein-Container-Betrieb
```

## Feststehende Umgebungsregeln

- **`mabasch-uat`** (Container + Volume) ist die geteilte UAT-Instanz. Sie wird **nur nach
  vollständigem Abschluss** eines Issues aktualisiert (neues Image bauen, Container/Volume
  neu anlegen, falls sich Seed-Daten geändert haben) — niemals für Zwischentests während
  der Entwicklung.
- **Jede Entwicklungs- und QA-Aktivität nutzt eine eigene, isolierte Docker-Instanz**
  (eigener Image-Tag, Container-Name, Port, Volume), die nach Gebrauch wieder vollständig
  entfernt wird (`docker rm -f`, `docker volume rm`, `docker rmi`).
- Empfohlene Port-Konvention, um Kollisionen zwischen parallel arbeitenden Rollen zu
  vermeiden:

  | Zweck | Port |
  | ----- | ---- |
  | `mabasch-uat` (geteilt, produktionsnah) | 8081 |
  | Ad-hoc manuelles Testen während der Entwicklung | 8090 |
  | QA-Reviewer (isolierte Instanz je Issue) | 8095 |
  | Docs-Agent (Screenshot-Generierung) | 8096 |

- Backend-Tests werden mit `dotnet run` im Testprojekt ausgeführt, **nicht** mit
  `dotnet test` (TUnit-Projekte sind ausführbare Microsoft.Testing.Platform-Programme;
  `dotnet test` erfordert unter .NET 10 ein separates Opt-in, das hier nicht eingerichtet
  ist):
  ```bash
  cd backend/MaBaSch.Tests && dotnet run
  ```

## Der Issue-getriebene Workflow

Jede Feature-/Bugfix-Anfrage durchläuft diesen Ablauf:

### 1. Issue sicherstellen

Prüfen, ob bereits ein passendes GitHub-Issue existiert:
```bash
gh issue list --state all --search "<Stichworte>"
```

Existiert **kein** passendes Issue: den Subagenten **`po-requirements-engineer`**
aufrufen. Er recherchiert den Code, schreibt ein vollständiges Issue (Problem/Motivation,
Akzeptanzkriterien, technische Hinweise, Out-of-Scope) und legt es per `gh issue create`
an. Ohne Issue-Nummer beginnt keine Implementierung.

### 2. Feature-Branch anlegen

Immer von aktuellem `main` abzweigen, niemals direkt auf `main` arbeiten:
```bash
git checkout main && git pull
git checkout -b feature/<issue-nummer>-<kurzbeschreibung>
```
Beispiel: `feature/12-csv-export`. **Die gesamte weitere Arbeit — Implementierung UND
Dokumentation — passiert auf diesem Branch.**

### 3. Team-Implementierung

Das Team bearbeitet das Issue auf dem Feature-Branch:

1. **`mabasch-backend-developer`** und **`mabasch-frontend-developer`** implementieren die
   Akzeptanzkriterien. Wenn das Issue den API-Vertrag (DTO-Form) bereits eindeutig
   festlegt, können beide parallel gestartet werden; ansonsten zuerst Backend, damit das
   Frontend gegen reale DTOs entwickelt.
2. **`mabasch-qa-reviewer`** verifiziert das Ergebnis: TUnit- und Vitest-Suiten, Backend-
   und Frontend-Build, sowie eine Ende-zu-Ende-Prüfung gegen eine eigene, isolierte
   Docker-Instanz per Playwright — geprüft werden alle Akzeptanzkriterien aus dem Issue.
3. Findet QA Lücken, die eine echte Design-Entscheidung erfordern, gehen sie zurück an
   Backend/Frontend; kleine Integrationsprobleme (z. B. abweichende Feldnamen zwischen
   DTO und TypeScript-Modell) behebt QA direkt.

### 4. Dokumentation

Erst wenn QA das Issue als erfüllt bestätigt hat: **`mabasch-docs-writer`** aktualisiert
`docs/` (Funktionsbeschreibung, ggf. Architektur/Setup, neue Screenshots über
`scripts/generate-screenshots.mjs` gegen eine eigene Docker-Instanz) — weiterhin auf
demselben Feature-Branch.

### 5. Commit & Push

Nach erfolgreichem Docs-Update:
```bash
git add -A
git commit -m "<prägnante Beschreibung>

Refs #<issue-nummer>"
git push -u origin feature/<issue-nummer>-<kurzbeschreibung>
gh pr create --title "<Titel>" --body "Closes #<issue-nummer>

<kurze Zusammenfassung was & warum>"
```

Der Push und das Erstellen des Pull Requests sind für diesen Workflow **vorab autorisiert**
— das PR wird gegen `main` erstellt, aber **nicht automatisch gemerged**; Merge ist eine
menschliche Entscheidung. Direkte Pushes auf `main` oder Force-Pushes bleiben ausdrücklich
ausgeschlossen und erfordern weiterhin Rückfrage.

## Häufige Befehle

```bash
# Backend
cd backend/MaBaSch && dotnet build
cd backend/MaBaSch.Tests && dotnet run          # Tests (nicht `dotnet test`)
cd backend/MaBaSch && dotnet ef migrations add <Name>

# Frontend
cd frontend/mabasch && npx ng build
cd frontend/mabasch && npm test                  # Vitest

# Doku
python -m mkdocs build --strict

# Docker (immer mit eigenem, isoliertem Tag/Name/Port/Volume — nie mabasch-uat)
docker build -t mabasch:<tag> .
docker run -d --name mabasch-<tag> -p <port>:8080 -v mabasch-<tag>-data:/app/data mabasch:<tag>
docker rm -f mabasch-<tag> && docker volume rm mabasch-<tag>-data && docker rmi mabasch:<tag>
```

## Rollen-Agenten

Definiert unter `.claude/agents/`:

| Agent | Rolle |
| ----- | ----- |
| `po-requirements-engineer` | Erstellt vollständige GitHub-Issues aus Anfragen |
| `mabasch-backend-developer` | Implementiert Backend-Änderungen (ASP.NET Core, EF Core) |
| `mabasch-frontend-developer` | Implementiert Frontend-Änderungen (Angular, Material) |
| `mabasch-qa-reviewer` | Verifiziert Tests, Build und Ende-zu-Ende-Verhalten |
| `mabasch-docs-writer` | Aktualisiert MkDocs-Dokumentation und Screenshots |

Jeder Agent kennt seinen Ausschnitt des Workflows im Detail — dieses Dokument beschreibt
nur die Orchestrierung zwischen ihnen.
