# recipes-for-me

Een receptenwebsite die je op je telefoon prettig kunt gebruiken. Iedereen kan de gepubliceerde recepten bekijken; de eigenaar logt in om recepten te beheren en favorieten te markeren.

> **Status:** de app draait als microservice (pod `recipes`, release 1.0.0) achter het portfolio op `/apps/recipes/`. De Angular-frontend (receptenlijst en receptpagina, NL/EN) haalt recepten op via de API-aanroepen hieronder; de backend-endpoints staan in `royhendriks-dev/portfolio`. Recepten beheren in de app zelf is er niet: de recepten komen als JSON-bestanden uit de portfolio-repo.

## Doel

Een zelfstandige receptenapp, los van de portfolio-frontend, die de bestaande inlog, backend en database van het portfolio hergebruikt in plaats van een tweede stack op te zetten.

De app is bereikbaar via het portfolio op `/apps/recipes/` (iframe in het terminal-startvenster van de map Projecten). Een eigen subdomein `recipes.royhendriks.com` is alleen een voorstel, geen bestaande configuratie.

## Functies (eerste versie)

Gebouwd:

1. Recepten bekijken zonder in te loggen (titel, categorie, ingrediënten met hoeveelheden, bereiding, notities en metadata).
2. Favorieten met een ster, opgeslagen in de database bij het account van de beheerder, met een favorietenweergave (alleen zichtbaar voor de ingelogde beheerder).
3. Ingrediënten delen naar je telefoon: Web Share API waar beschikbaar, anders kopiëren naar het klembord (voor iedereen). Er is geen automatische koppeling met een boodschappenapp. Daarnaast kan elke bezoeker, zonder inlog, een recept naar zijn eigen Discord-server sturen (zie *Naar je eigen Discord-server*).
4. Keukentimers, personen-slider en een responsieve, mobile-first interface.
5. Volledig-scherm-knop in de kopbalk (Fullscreen API, `src/app/fullscreen.service.ts`). De knop verschijnt alleen als de browser volledig scherm toestaat (`document.fullscreenEnabled`). In het portfolio-iframe vereist dat `allow="fullscreen"` op het iframe in de portfolio-repo; zonder dat blijft de knop verborgen. iPhone-Safari ondersteunt de API niet op pagina's, daar is de knop ook niet zichtbaar.

Nog niet gebouwd: recepten aanmaken, bewerken, publiceren en verwijderen in de app (de recepten komen uit bestanden in de portfolio-repo), PWA, een eigen login in deze app.

Bewust uitgesteld: recepten van meerdere gebruikers, beoordelingen, weekmenu's, boodschappenintegraties en een eigen backend.

## Architectuur

| Onderdeel | Waar | Technologie |
|---|---|---|
| Frontend | deze repository | Angular, TypeScript, SCSS, nginx-container |
| Backend, authenticatie, database | [`royhendriks-dev/portfolio`](https://github.com/royhendriks-dev/portfolio) | Quarkus (Java), PostgreSQL, Flyway |

- De receptenfrontend praat same-origin met de backend: de browser laadt de app via het portfolio (`/apps/recipes/`) en roept `/api/` aan op dezelfde site, waar de nginx van het portfolio (niet de nginx in deze repo, die `/api/` niet doorstuurt) het naar de backend stuurt. CORS of cookie-instellingen worden daarvoor niet versoepeld. De pod `recipes` zelf praat niet met de backend (NetworkPolicies in de portfolio-repo).
- Deze app heeft geen eigen login. Hij vraagt `GET /api/auth/session` en gebruikt de sessie van het portfolio; inloggen doe je daar. De nginx van het portfolio geeft de sessiecookie niet door aan de pod.
- Receptfunctionaliteit staat in de backend als apart package met eigen migraties (`recipe`, `recipe_translation`, `recipe_favorite`), zodat het later te splitsen blijft.
- Autorisatie gebeurt altijd op de server; de frontend toont of verbergt alleen.

De volledige beoordeling van de portfolio-code staat in de projectnotities (`recipes-assessment/beoordeling-en-plan.md` in de projectbestanden).

## Gefaseerd plan

Oorspronkelijk plan; de stand per fase is gecontroleerd tegen de repo en de portfolio-changelog. De recepten staan inmiddels NL en EN in de backend en niet alleen Nederlands.

| Fase | Inhoud | Repository | Stand |
|---|---|---|---|
| 0 | Keuzes vastleggen, README en `AGENTS.md` | recipes-for-me | gedaan |
| 1 | Migratie en package `recipe`: publiek lezen (beheer en publiceren niet) | portfolio | lezen gedaan (V6, V7); beheer niet gebouwd |
| 2 | Favorieten-endpoints met tests | portfolio | gedaan (V8) |
| 3 | Angular-skelet: routing, publieke lijst en detail | recipes-for-me | gedaan; eigen login vervallen (sessie van het portfolio) |
| 4 | Beheer-UI | recipes-for-me | niet gebouwd |
| 5 | Favorietenster, favorietenweergave, ingrediënten delen | recipes-for-me | gedaan |
| 6 | PWA, laad-, leeg- en foutstaten, mobiele controle | recipes-for-me | PWA niet gebouwd |
| 7 | Infrastructuur en login-hardening voor livegang | portfolio | pod in `k8s/recipes.yaml`; login-hardening in de portfolio-repo |

## Werkwijze

- Elke PR heeft een Jira-ticket in project PRW met het voorvoegsel `RCFM` in de titel (`RCFM - <naam van de PR>`).
- Elk ticket wordt gedocumenteerd in Confluence (space PW) onder `Recipes-for-me` > `Tickets RCFM`.
- Kwaliteitscontrole loopt via SonarQube Cloud; het `SONAR_TOKEN` is ingesteld voor het project (workflow `ci.yml`, configuratie in `sonar-project.properties`; organisatie en projectsleutel daarin zijn een aanname die nog tegen SonarQube Cloud gecontroleerd moet worden).
- Releaseflow: feature-PR's gaan naar `develop` (CI en Sonar draaien; er wordt geen image gepusht en niets gereleased). Een PR `develop` -> `main` is een nieuwe release; die doet Roy zelf. Daarna start Roy de workflow Release (zie hieronder) op `main`. Dependabot maakt zijn PR's naar `develop` (`.github/dependabot.yml`). Regels voor mensen en agents staan in `AGENTS.md`.

## Lokaal ontwikkelen

Vereist Node 22.22.3 of nieuwer (Angular 22 weigert oudere versies).

```sh
npm ci
npm start           # dev-server op http://localhost:4300/apps/recipes/, /api wordt doorgestuurd naar http://localhost:8080 (proxy.conf.json)
npm run test:ci     # unit-tests (Vitest) met coverage
npm run build       # productiebuild in dist/recipes/browser
```

De dev-server draait bewust op poort 4300 (niet de standaard 4200, die is van de portfolio-frontend) en met `servePath` `/apps/recipes/`. Zo kan de dev-server van het portfolio (`npm start` in `portfolio/frontend`, http://localhost:4200) `/apps/recipes/` naar deze app doorsturen en laadt het Recepten-venster daar de echte app. Start eerst deze app en open dan http://localhost:4200 (portfolio); losse app: http://localhost:4300/apps/recipes/. Zonder draaiende recepten-dev-server toont het portfolio een 503-pagina in dat venster.

De app gebruikt `<base href="./">` en bouwt daarom zonder aanpassing onder een subpad zoals `/apps/recipes/`.

## Wat er nu in zit

- Receptenlijst (`#/`) en receptpagina (`#/recept/<id>`); routes zijn hash-routes zodat de app onder elk subpad werkt zonder serverconfiguratie.
- Receptpagina: personen-slider (2 of 4) die hoeveelheden schaalt en bovenin het inklapbare ingrediëntenblok staat (inklappen verbergt dus ook de slider), inklapbare afvinkbare ingrediënten en timers voor iedereen. De deelknop voor de ingrediëntenlijst (Web Share API, anders klembord, anders een tekstvak om zelf te kopiëren) en de Discord-knoppen zijn er voor iedereen. Alleen voor de ingelogde beheerder (zie *Favorieten alleen voor de beheerder*): de ster als favoriet.
- Favorieten: bij de beheerder staat in de receptenlijst een blok *Favorieten* bovenaan en een ster bij favoriete recepten (met verborgen tekst *(Favoriet)* voor schermlezers). Bezoekers zien dat blok, de sterren en de ster-knop niet; de recepten, timers, afvinken en delen werken voor hen gewoon.
- Nederlandse en Engelse interface. In het portfolio (iframe) volgt de app de taal van de NL/EN-knop in de titelbalk: dezelfde `localStorage`-sleutel `lang` (zelfde origin), met een `storage`-event bij wisselen; de app heeft daar geen eigen taalknop. Los draaiend (buiten een iframe) staat er wel een taalknop. Receptinhoud komt per taal uit de backend.
- Receptenlijst: gegroepeerd onder kopjes Hoofdgerecht, Bijgerecht en Zoet (met aantal), een filter per soort, en per recept een categorie-icoon (er zijn nog geen afbeeldingen in de data).
- Licht en donker thema via `prefers-color-scheme`; systeemlettertypen, geen externe requests.
- Keukentimers: een vast paneel rechts naast de inhoud (onder de inhoud op smalle schermen; niet zwevend; blijft staan bij wisselen van pagina). Het paneel gebruikt dezelfde kaartstijl en kleuren als het receptblok en begint op de receptpagina op dezelfde bovenrand (marge onder de terug-link). Elke timer is een kaart met de naam als kopje (standaard Keukentimer, met een bewerkknop om de naam te wijzigen), ronde voortgangsring met tijd en status (Klaar om te starten, Loopt, Gepauzeerd, Tijd is om: dus niet alleen met kleur), Tijd toevoegen +1m/+5m, eigen minuten/seconden (naast elkaar, standaard leeg: wat je invult pakt Starten meteen, zonder invoer geldt de ingestelde tijd, standaard 5 minuten), Starten/Pauze, Reset en Verwijder timer. Met de knop Timer toevoegen maak je zelf timers aan; een stap met `timerMinutes` start er een. De tijd rekent op een eindtijd, dus klopt ook als het scherm of de tab even uit was. Bij afloop volgt een pieptoon (waar de browser audio toestaat), een melding voor schermlezers en, waar ondersteund, trilling; zolang een timer loopt vraagt de app (waar ondersteund) het scherm aan te houden. Timers staan alleen in het geheugen: herladen wist ze.

## API-contract

Het backend-contract staat in de portfolio-repo (`backend/README.md`, portfolio PR #82 op het moment van schrijven; die file is bij het bijwerken van deze README niet zelf gelezen, de velden hieronder komen uit de beschrijving van de backend-thread). Alleen lezen en openbaar. De frontend roept relatieve paden op dezelfde origin aan (`/api/...`, niet relatief aan `/apps/recipes/`):

| Aanroep | Antwoord |
|---|---|
| `GET /api/recipes?lang=nl\|en` | lijst van `{ id, title, category, tags, minutes, servings }`; `id` is de slug, `category` is `main`, `side` of `sweet` |
| `GET /api/recipes/{id}?lang=nl\|en` | dezelfde velden plus `ingredients: [{ amount, unit, name, group, optional }]`, `steps: [{ text, group }]` en `notes: [tekst]` |

- Onbekende taal valt terug op NL; onbekend id geeft 404 `{"error":"not_found"}` (de app toont "Dit recept bestaat niet"); zonder database 503 (de app toont een foutmelding met "opnieuw proberen").
- `minutes` en `servings` kunnen leeg zijn. `amount` geldt voor `servings` personen en kan leeg zijn; dan staat de hele regel in `name`. Een recept zonder `servings` krijgt geen personen-slider en wordt niet geschaald; een leeg `amount` toont geen getal. De slider kent alleen 2 en 4 personen (stap 2); een recept met 3 of meer personen begint op 4, anders op 2.
- `steps[].timerMinutes` is een voorstel van de frontend en bestaat nog niet in de backend; het veld is optioneel en de timerknop verschijnt alleen als het er is. Eigen timers werken los daarvan.
- Beschrijving, moeilijkheid en afbeelding bestaan niet in dit contract en worden niet getoond.

De types staan in `src/app/recipe.model.ts`, de aanroepen in `src/app/recipe.service.ts`. Testdata in dit formaat staat in `src/testing/fixtures.ts`.

## Favorieten alleen voor de beheerder

- De app heeft geen eigen login. Hij vraagt bij het starten `GET /api/auth/session` (zelfde origin, dus het sessiecookie van het portfolio gaat mee): 200 met `{ username, roles, csrfToken }` en de rol `admin` betekent beheerder, 204 of een fout betekent bezoeker (`src/app/auth.service.ts`). Inloggen doe je in het portfolio (Start, Inloggen); na inloggen laad je de recepten-app opnieuw om de ster te zien.
- Favorieten staan in de backend (portfolio-repo, tabel `recipe_favorite`, migratie V8) en niet meer in `localStorage`: `GET /api/recipes/favorites` (lijst van slugs), `PUT` en `DELETE /api/recipes/favorites/{id}` met de header `X-CSRF-Token` uit de sessie (`src/app/favorites.service.ts`). Zonder login geven die endpoints 401, zonder CSRF-token 403, bij een onbekend recept 404. Mislukt opslaan, dan draait de app de ster terug en toont een melding.
- De beveiliging zit in de backend (`@RolesAllowed("admin")`); het verbergen van de knoppen in de app is alleen gemak.
- Oude favorieten uit `localStorage` (`recipes.favorites`) worden niet overgenomen; de sleutel wordt niet meer gebruikt.

## Naar je eigen Discord-server

Voor iedereen, zonder inlog op de site. De backend (`royhendriks-dev/portfolio`, package `discord`, zie daar `backend/README.md`, *Discord-koppeling*) doet het zware werk; deze app heeft alleen knoppen (`src/app/discord.service.ts`, in `recipe-detail`).

- Knop *Koppel je Discord-server* opent `/api/discord/connect` in een **nieuw tabblad** (Discord laat zich niet in een iframe laden). De bezoeker kiest bij Discord zelf een kanaal; daarna komt hij terug op `/apps/recipes/?discord=connected|denied|limit|error` en toont de app een melding (`role="status"`, te sluiten) die `?discord=` weer uit het adres haalt.
- Is er een koppeling, dan staat er *Stuur naar Discord* (`POST /api/discord/share` met alleen `{recipe, lang, servings}`; de backend bouwt het bericht uit het eigen recept, de bezoeker kan geen tekst meesturen) en *Ontkoppel Discord* (`DELETE /api/discord/link`). Foutcodes (429 te snel, 410/401 koppeling weg, rest) worden korte meldingen in NL/EN.
- De app bewaart zelf niets: de koppeling hangt aan een HttpOnly-cookie dat alleen de backend ziet, de webhook komt nooit in de browser. De status (`GET /api/discord/status`) wordt opgehaald bij het openen van een receptpagina en opnieuw als het tabblad weer focus krijgt (na koppelen in het andere tabblad).
- Staat de koppeling uit op de server (geen client id en sleutel), dan toont de app de Discord-knoppen niet.

## Container en images

- `Dockerfile`: bouwt de app en serveert de statische bestanden met `nginxinc/nginx-unprivileged` op poort 8080 (config in `docker/nginx.conf`, CSP met `frame-ancestors 'self'`). Alleen de nginx-laag is architectuurafhankelijk; de build is voor amd64 en arm64 gelijk.
- `.github/workflows/images.yml` bouwt `linux/amd64` en `linux/arm64` en pusht naar `ghcr.io/royhendriks-dev/recipes-for-me` bij een push naar `main`, dus bij het mergen van een release-PR (tags `sha-<korte-sha>` en `latest`); een push naar `develop` bouwt geen image en bij een `v*`-tag (semver). Op een PR (ook naar `develop`) wordt alleen gebouwd, niet gepusht.
- Versie: `public/version.json` (`{name, version, commit}`, lokaal `dev`) wordt als statisch bestand meegeleverd; het Dockerfile overschrijft het met de build-args `APP_VERSION` en `APP_COMMIT`, die `images.yml` vult (tag `v1.2.3` geeft `1.2.3`, anders `dev`; commit = volledige sha). Het portfolio leest het via `/apps/recipes/version.json` in Start > Systeemeigenschappen (blok "Versies recepten").
- Release: `.github/workflows/release.yml` start je handmatig (Actions > Release > Run workflow, branch `main`) met een versie `x.y.z`. Hij controleert dat CI voor die commit groen is en dat de tag nog niet bestaat, maakt de tag `vx.y.z` met een GitHub Release (automatische notes) en start `images.yml` op die tag, zodat image `x.y.z` op GHCR komt. De release-workflow moet zelf `images.yml` starten, omdat tags die met `GITHUB_TOKEN` gemaakt worden geen andere workflows triggeren.
- `.github/workflows/ci.yml` (draait op pushes naar `main` en `develop` en op elke PR): tests met coverage (drempel 80% voor statements, branches, functions en lines, ingesteld in `angular.json`), build en SonarQube Cloud (`sonar-project.properties`); de job wacht op de Sonar-quality gate en faalt als die niet slaagt, behalve bij een push naar `develop`: daar geeft het gratis SonarQube-plan de gate van een niet-main-branch niet vrij ("Organization is not allowed to access data from non main branches"), dus daar loopt de scan wel maar wacht de job niet op de gate (PR's en `main` wel).
- Let op: de Docker-build is lokaal niet uitgeprobeerd (geen Docker-daemon beschikbaar); de eerste echte run is die van de workflow.
