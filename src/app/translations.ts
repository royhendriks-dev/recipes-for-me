import { Lang } from './recipe.model';

export type TranslationKey =
  | 'appName'
  | 'language'
  | 'switchTo'
  | 'fullscreenEnter'
  | 'fullscreenExit'
  | 'minutes'
  | 'favorite'
  | 'favoriteSaved'
  | 'favoriteAdded'
  | 'favoriteRemoved'
  | 'favoriteError'
  | 'favorites'
  | 'servings'
  | 'person'
  | 'people'
  | 'ingredients'
  | 'checked'
  | 'share'
  | 'shareHint'
  | 'shareTitle'
  | 'shareIntro'
  | 'shareIntroPlain'
  | 'copied'
  | 'copyFailed'
  | 'ingredientsAsText'
  | 'discordConnect'
  | 'discordHint'
  | 'discordSend'
  | 'discordDisconnect'
  | 'discordSent'
  | 'discordRateLimited'
  | 'discordGone'
  | 'discordError'
  | 'discordDisconnected'
  | 'discordNewTab'
  | 'discordNoticeConnected'
  | 'discordNoticeDenied'
  | 'discordNoticeLimit'
  | 'discordNoticeError'
  | 'dismiss'
  | 'discordHeading'
  | 'steps'
  | 'loading'
  | 'error'
  | 'retry'
  | 'allRecipes'
  | 'noRecipes'
  | 'listError'
  | 'back'
  | 'notFound'
  | 'optional'
  | 'notes'
  | 'main'
  | 'side'
  | 'sweet'
  | 'timers'
  | 'filterLabel'
  | 'filterAll'
  | 'timerStart'
  | 'timerNew'
  | 'timerDefaultName'
  | 'timerPause'
  | 'timerRemove'
  | 'timerDone'
  | 'timerReady'
  | 'timerNone'
  | 'timerStepLabel'
  | 'timerEdit'
  | 'timerEditDone'
  | 'timerAddTime'
  | 'timerCustom'
  | 'timerReset'
  | 'timerIdle'
  | 'timerRunning'
  | 'timerPaused'
  | 'timerTimeUp'
  | 'timerMinShort'
  | 'timerSecShort';

export const TRANSLATIONS: Record<Lang, Record<TranslationKey, string>> = {
  nl: {
    appName: 'Recepten voor mij',
    language: 'Taal',
    switchTo: 'Switch to English',
    fullscreenEnter: 'Volledig scherm',
    fullscreenExit: 'Volledig scherm sluiten',
    minutes: 'minuten',
    favorite: 'Favoriet',
    favoriteSaved: 'Opgeslagen als favoriet',
    favoriteAdded: 'Toegevoegd aan je favorieten',
    favoriteRemoved: 'Verwijderd uit je favorieten',
    favoriteError: 'Favoriet opslaan is niet gelukt. Probeer het opnieuw.',
    favorites: 'Favorieten',
    servings: 'Aantal personen',
    person: 'persoon',
    people: 'personen',
    ingredients: 'Ingrediënten',
    checked: 'afgevinkt',
    share: 'Deel ingrediëntenlijst',
    shareHint:
      'Op je telefoon kies je een app uit het deelmenu, bijvoorbeeld Notities of een berichtenapp. Werkt dat niet, dan wordt de lijst gekopieerd.',
    shareTitle: 'Boodschappen',
    shareIntro: 'Ingrediënten voor',
    shareIntroPlain: 'Ingrediënten',
    copied: 'Lijst gekopieerd naar het klembord',
    copyFailed: 'Kopiëren lukte niet. Selecteer de tekst hieronder en kopieer die zelf.',
    ingredientsAsText: 'Ingrediëntenlijst als tekst',
    discordHeading: 'Naar je eigen Discord-server',
    discordConnect: 'Koppel je Discord-server',
    discordHint: 'Je kiest bij Discord zelf een kanaal; inloggen op deze site is niet nodig. We sturen alleen de ingrediënten van dit recept, nooit iets anders. Je kunt altijd ontkoppelen.',
    discordSend: 'Stuur naar Discord',
    discordDisconnect: 'Ontkoppel Discord',
    discordSent: 'Naar Discord gestuurd',
    discordRateLimited: 'Even wachten: je kunt maar eens per 10 seconden iets sturen',
    discordGone: 'De koppeling bestaat niet meer. Koppel Discord opnieuw.',
    discordError: 'Sturen naar Discord lukte niet. Probeer het later opnieuw.',
    discordDisconnected: 'Discord ontkoppeld',
    discordNewTab: 'opent in een nieuw tabblad',
    discordNoticeConnected: 'Discord is gekoppeld. Je kunt nu een recept naar je kanaal sturen; ga terug naar de recepten-app of sluit dit tabblad.',
    discordNoticeDenied: 'Koppelen met Discord is geannuleerd.',
    discordNoticeLimit: 'Deze Discord-server heeft al het maximale aantal koppelingen. Ontkoppel er eerst een.',
    discordNoticeError: 'Koppelen met Discord is niet gelukt. Probeer het opnieuw.',
    dismiss: 'Sluiten',
    steps: 'Bereiding',
    loading: 'Recept laden…',
    error: 'Het recept kon niet worden geladen.',
    retry: 'Opnieuw proberen',
    allRecipes: 'Alle recepten',
    noRecipes: 'Er zijn nog geen recepten.',
    listError: 'De recepten konden niet worden geladen.',
    back: 'Terug naar alle recepten',
    notFound: 'Dit recept bestaat niet (meer).',
    optional: 'optioneel',
    notes: 'Notities',
    filterLabel: 'Toon soort gerecht',
    filterAll: 'Alles',
    main: 'Hoofdgerecht',
    side: 'Bijgerecht',
    sweet: 'Zoet',
    timers: 'Keukentimers',
    timerStart: 'Starten',
    timerNew: 'Timer toevoegen',
    timerDefaultName: 'Keukentimer',
    timerPause: 'Pauzeren',
    timerRemove: 'Verwijder timer',
    timerDone: 'Klaar',
    timerReady: 'is klaar',
    timerNone: 'Nog geen timers. Start er een bij een stap of voeg er zelf een toe.',
    timerEdit: 'Naam wijzigen',
    timerEditDone: 'Naam opslaan',
    timerAddTime: 'Tijd toevoegen',
    timerCustom: 'Aangepast',
    timerReset: 'Reset',
    timerIdle: 'Klaar om te starten',
    timerRunning: 'Loopt',
    timerPaused: 'Gepauzeerd',
    timerTimeUp: 'Tijd is om!',
    timerMinShort: 'minuten',
    timerSecShort: 'seconden',
    timerStepLabel: 'Timer',
  },
  en: {
    appName: 'Recipes for me',
    language: 'Language',
    switchTo: 'Wissel naar Nederlands',
    fullscreenEnter: 'Full screen',
    fullscreenExit: 'Exit full screen',
    minutes: 'minutes',
    favorite: 'Favorite',
    favoriteSaved: 'Saved as favorite',
    favoriteAdded: 'Added to your favorites',
    favoriteRemoved: 'Removed from your favorites',
    favoriteError: 'Saving the favorite failed. Please try again.',
    favorites: 'Favorites',
    servings: 'Servings',
    person: 'person',
    people: 'people',
    ingredients: 'Ingredients',
    checked: 'checked',
    share: 'Share ingredient list',
    shareHint:
      'On your phone you pick an app from the share menu, for example Notes or a messaging app. If that does not work, the list is copied.',
    shareTitle: 'Groceries',
    shareIntro: 'Ingredients for',
    shareIntroPlain: 'Ingredients',
    copied: 'List copied to the clipboard',
    copyFailed: 'Copying failed. Select the text below and copy it yourself.',
    ingredientsAsText: 'Ingredient list as text',
    discordHeading: 'To your own Discord server',
    discordConnect: 'Connect your Discord server',
    discordHint: 'You pick a channel at Discord yourself; no login on this site is needed. We only send the ingredients of this recipe, never anything else. You can disconnect at any time.',
    discordSend: 'Send to Discord',
    discordDisconnect: 'Disconnect Discord',
    discordSent: 'Sent to Discord',
    discordRateLimited: 'Please wait: you can only send once every 10 seconds',
    discordGone: 'The connection no longer exists. Connect Discord again.',
    discordError: 'Sending to Discord failed. Please try again later.',
    discordDisconnected: 'Discord disconnected',
    discordNewTab: 'opens in a new tab',
    discordNoticeConnected: 'Discord is connected. You can now send a recipe to your channel; go back to the recipes app or close this tab.',
    discordNoticeDenied: 'Connecting to Discord was cancelled.',
    discordNoticeLimit: 'This Discord server already has the maximum number of connections. Disconnect one first.',
    discordNoticeError: 'Connecting to Discord failed. Please try again.',
    dismiss: 'Close',
    steps: 'Method',
    loading: 'Loading recipe…',
    error: 'The recipe could not be loaded.',
    retry: 'Try again',
    allRecipes: 'All recipes',
    noRecipes: 'There are no recipes yet.',
    listError: 'The recipes could not be loaded.',
    back: 'Back to all recipes',
    notFound: 'This recipe does not exist (any more).',
    optional: 'optional',
    notes: 'Notes',
    filterLabel: 'Show type of dish',
    filterAll: 'All',
    main: 'Main course',
    side: 'Side dish',
    sweet: 'Sweet',
    timers: 'Kitchen timers',
    timerStart: 'Start',
    timerNew: 'Add timer',
    timerDefaultName: 'Kitchen timer',
    timerPause: 'Pause',
    timerRemove: 'Remove timer',
    timerDone: 'Done',
    timerReady: 'is ready',
    timerNone: 'No timers yet. Start one at a step or add your own.',
    timerEdit: 'Edit name',
    timerEditDone: 'Save name',
    timerAddTime: 'Add time',
    timerCustom: 'Custom',
    timerReset: 'Reset',
    timerIdle: 'Ready to start',
    timerRunning: 'Running',
    timerPaused: 'Paused',
    timerTimeUp: "Time's up!",
    timerMinShort: 'minutes',
    timerSecShort: 'seconds',
    timerStepLabel: 'Timer',
  },
};
