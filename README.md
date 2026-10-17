# recipes-for-me

Een receptenwebsite die je op je telefoon prettig kunt gebruiken. Iedereen kan de gepubliceerde recepten bekijken; de eigenaar logt in om recepten te beheren en favorieten te markeren.

> **Status:** begin van de app. De Angular-frontend staat er (één receptpagina met het ingebouwde voorbeeldrecept uit de UI-mock, NL/EN). De koppeling met de backend volgt in een volgende PR.

## Doel

Een zelfstandige receptenapp, los van de portfolio-frontend, die de bestaande inlog, backend en database van het portfolio hergebruikt in plaats van een tweede stack op te zetten.

Voorgestelde adres: `recipes.royhendriks.com`. Dit is een voorstel, geen bestaande configuratie.

## Functies (eerste versie)

1. Recepten bekijken zonder in te loggen (titel, beschrijving, ingrediënten met hoeveelheden, bereiding, optioneel afbeelding en metadata).
2. Inloggen als eigenaar met het bestaande portfolio-account.
3. Recepten aanmaken, bewerken, publiceren, depubliceren en verwijderen (alleen eigenaar, server-side afgedwongen).
4. Favorieten met een ster, opgeslagen in de database per gebruiker, met een favorietenweergave.
5. Ingrediënten delen naar je telefoon: Web Share API waar beschikbaar, anders kopiëren naar het klembord. Er is geen automatische koppeling met een boodschappenapp.
6. Responsieve, mobile-first interface; PWA waar dat zinvol is.

Bewust uitgesteld: recepten van meerdere gebruikers, beoordelingen, weekmenu's, boodschappenintegraties en een eigen backend.

## Architectuur

| Onderdeel | Waar | Technologie |
|---|---|---|
| Frontend | deze repository | Angular, TypeScript, SCSS, nginx-container |
| Backend, authenticatie, database | [`royhendriks-dev/portfolio`](https://github.com/royhendriks-dev/portfolio) | Quarkus (Java), PostgreSQL, Flyway |

- De receptenfrontend praat same-origin met de backend: nginx stuurt `/api/` door naar dezelfde backend als het portfolio. CORS of cookie-instellingen worden daarvoor niet versoepeld.
- Inloggen gebeurt op de receptensite zelf tegen dezelfde gebruikerstabel. De sessie is per site; echte single sign-on tussen beide sites is niet mogelijk zonder het cookiemodel (`__Host-`, `SameSite=Strict`) te verzwakken.
- Receptfunctionaliteit komt in de backend als apart package met eigen migraties, zodat het later te splitsen blijft.
- Autorisatie gebeurt altijd op de server; de frontend toont of verbergt alleen.

De volledige beoordeling van de portfolio-code staat in de projectnotities (`recipes-assessment/beoordeling-en-plan.md` in de projectbestanden).

## Gefaseerd plan

| Fase | Inhoud | Repository |
|---|---|---|
| 0 | Keuzes vastleggen (favorieten alleen voor de eigenaar, afbeelding via URL, alleen Nederlands), README en `AGENTS.md` | recipes-for-me |
| 1 | Migratie en package `recipe`: publiek lezen, beheer, publiceren | portfolio |
| 2 | Favorieten-endpoints met tests | portfolio |
| 3 | Angular-skelet: routing, inloggen, publieke lijst en detail | recipes-for-me |
| 4 | Beheer-UI | recipes-for-me |
| 5 | Favorietenster, favorietenweergave, ingrediënten delen | recipes-for-me |
| 6 | PWA, laad-, leeg- en foutstaten, mobiele controle | recipes-for-me |
| 7 | Infrastructuur en login-hardening voor livegang | portfolio |

## Werkwijze

- Elke PR heeft een Jira-ticket in project PRW met het voorvoegsel `RCFM` in de titel (`RCFM - <naam van de PR>`).
- Elk ticket wordt gedocumenteerd in Confluence (space PW) onder `Recipes-for-me` > `Tickets RCFM`.
- Kwaliteitscontrole loopt via SonarQube Cloud; het `SONAR_TOKEN` is ingesteld voor het project (workflow `ci.yml`, configuratie in `sonar-project.properties`; organisatie en projectsleutel daarin zijn een aanname die nog tegen SonarQube Cloud gecontroleerd moet worden).
- Wijzigingen gaan via een PR naar `main`. Regels voor mensen en agents staan in `AGENTS.md`.

## Lokaal ontwikkelen

Vereist Node 22.22.3 of nieuwer (Angular 22 weigert oudere versies).

```sh
npm ci
npm start           # dev-server op http://localhost:4200
npm run test:ci     # unit-tests (Vitest) met coverage
npm run build       # productiebuild in dist/recipes/browser
```

De app gebruikt `<base href="./">` en bouwt daarom zonder aanpassing onder een subpad zoals `/apps/recipes/`.

## Wat er nu in zit

- Receptpagina: ster als favoriet (nu nog in `localStorage`, dus per apparaat), personen-slider 1-4 die hoeveelheden schaalt, inklapbare afvinkbare ingrediënten, deelknop (Web Share API, anders klembord, anders een tekstvak om zelf te kopiëren).
- Nederlandse en Engelse interface; de taalknop bewaart de keuze in `localStorage`. Receptinhoud is nu nog het ingebouwde voorbeeld in `src/app/sample-recipe.ts`.
- Licht en donker thema via `prefers-color-scheme`; systeemlettertypen, geen externe requests.
- Keukentimers zitten er bewust nog niet in.

## Container en images

- `Dockerfile`: bouwt de app en serveert de statische bestanden met `nginxinc/nginx-unprivileged` op poort 8080 (config in `docker/nginx.conf`, CSP met `frame-ancestors 'self'`). Alleen de nginx-laag is architectuurafhankelijk; de build is voor amd64 en arm64 gelijk.
- `.github/workflows/images.yml` bouwt `linux/amd64` en `linux/arm64` en pusht naar `ghcr.io/royhendriks-dev/recipes-for-me` bij een push naar `main` (tags `sha-<korte-sha>` en `latest`) en bij een `v*`-tag (semver). Op een PR wordt alleen gebouwd, niet gepusht.
- `.github/workflows/ci.yml`: tests met coverage, build en SonarQube Cloud (`sonar-project.properties`).
- Let op: de Docker-build is lokaal niet uitgeprobeerd (geen Docker-daemon beschikbaar); de eerste echte run is die van de workflow.
