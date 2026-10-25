# AGENTS.md

Instructies voor mensen en AI-agents die in deze repository werken. Eigenaar: Roy (royhendriks-dev). Taal van communicatie: Nederlands.

## Wat is dit

Losse Angular-frontend (standalone components, signals, SCSS, Vitest) voor recepten. Backend, authenticatie en database staan in [`royhendriks-dev/portfolio`](https://github.com/royhendriks-dev/portfolio); wijzigingen daaraan horen daar, niet hier. De app draait als statische site (nginx) en wordt later in een iframe op `/apps/recipes/` in het portfolio geladen (zelfde origin). Daarom gebruikt `src/index.html` een relatieve `<base href="./">`; gebruik nooit absolute paden naar assets.

## Commando's

```sh
npm ci              # installeren (Node 22.22.3+ of 24 vereist door Angular 22)
npm start           # dev-server
npm run test:ci     # unit-tests met coverage (coverage/recipes/lcov.info)
npm run build       # productiebuild naar dist/recipes/browser
```

## Regels

- WCAG 2.2 AA is vereist bij elke UI-wijziging (contrast, focus, toetsenbord, 44 px aanraakdoelen, labels, `lang`-attribuut).
- UI-teksten staan in `src/app/translations.ts` voor zowel `nl` als `en`; receptinhoud komt per taal uit de backend.
- Geen secrets in de repo. `SONAR_TOKEN` staat als GitHub-secret.
- Nooit beweren dat een test slaagde zonder dat hij gedraaid is.
- Kleine, gerichte wijzigingen; geen nieuwe frameworks of auth in deze repo.
- Discord (`src/app/discord.service.ts`): de app bewaart nooit een webhook of token en stuurt alleen `{recipe, lang, servings}` naar `/api/discord/share`; de webhook, het client secret en de limieten horen in de backend (zie README, *Naar je eigen Discord-server*). Koppelen opent altijd in een nieuw tabblad.

## Branches en mergen

- Feature-PR's hebben base `develop`. De thread mag ze zelf mergen (squash) zodra CI en Sonar groen zijn.
- CI wacht op de Sonar-gate bij PR's en `main`, niet bij een push naar `develop` (SonarQube Cloud geeft daar de gate niet vrij); een rode push-run op `develop` door "non main branches" is dus een configuratiefout, geen codefout.
- `develop` -> `main` is een release-PR. Open of merge die niet op eigen initiatief; Roy doet dat zelf, net als tags en releases.
- Spoedfix: branch `hotfix/<naam>` naar `main`, daarna `main` terug in `develop`.

## Checklist voor elke Pull Request

1. Jira-ticket in project PRW met titel `RCFM - <naam>` en een Confluence-pagina onder `Recipes-for-me` > `Tickets RCFM` (space PW) met titel `<Jira-key> RCFM - <naam>`.
2. README bijwerken met alleen gecontroleerde feiten.
3. Tests toevoegen of bijwerken; `npm run test:ci` en `npm run build` groen.
4. Technisch diagram in Confluence bijwerken als een endpoint, service, container of workflow verandert.
5. Nooit tags of releases maken.
