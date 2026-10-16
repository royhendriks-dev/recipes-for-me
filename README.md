# recipes-for-me

Een receptenwebsite die je op je telefoon prettig kunt gebruiken. Iedereen kan de gepubliceerde recepten bekijken; de eigenaar logt in om recepten te beheren en favorieten te markeren.

> **Status:** startfase. Deze repository bevat nog geen code. De README beschrijft wat er gebouwd gaat worden en hoe, zodat elke volgende PR daarop kan aansluiten.

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
- Kwaliteitscontrole loopt via SonarQube Cloud; het `SONAR_TOKEN` is ingesteld voor het project. De workflow en `sonar-project.properties` komen in fase 0.
- Wijzigingen gaan via een PR naar `main`.

## Lokaal ontwikkelen

Nog niet van toepassing: er is nog geen code. Zodra het Angular-skelet er is (fase 3) komen de installatie- en startcommando's hier.
