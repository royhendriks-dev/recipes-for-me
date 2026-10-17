import { Lang } from './recipe.model';

export type TranslationKey =
  | 'appName'
  | 'language'
  | 'switchTo'
  | 'minutes'
  | 'favorite'
  | 'favoriteSaved'
  | 'favoriteAdded'
  | 'favoriteRemoved'
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
  | 'timerTitle'
  | 'timerLabel'
  | 'timerAddTime'
  | 'timerCustom'
  | 'timerSet'
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
    minutes: 'minuten',
    favorite: 'Favoriet',
    favoriteSaved: 'Opgeslagen als favoriet',
    favoriteAdded: 'Toegevoegd aan je favorieten',
    favoriteRemoved: 'Verwijderd uit je favorieten',
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
    timerDefaultName: 'Eigen timer',
    timerPause: 'Pauzeren',
    timerRemove: 'Verwijderen',
    timerDone: 'Klaar',
    timerReady: 'is klaar',
    timerNone: 'Nog geen timers. Start er een bij een stap of voeg er zelf een toe.',
    timerTitle: 'Keukentimer',
    timerLabel: 'Timer naam',
    timerAddTime: 'Tijd toevoegen',
    timerCustom: 'Aangepast',
    timerSet: 'Instellen',
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
    minutes: 'minutes',
    favorite: 'Favorite',
    favoriteSaved: 'Saved as favorite',
    favoriteAdded: 'Added to your favorites',
    favoriteRemoved: 'Removed from your favorites',
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
    timerDefaultName: 'Custom timer',
    timerPause: 'Pause',
    timerRemove: 'Remove',
    timerDone: 'Done',
    timerReady: 'is ready',
    timerNone: 'No timers yet. Start one at a step or add your own.',
    timerTitle: 'Kitchen timer',
    timerLabel: 'Timer name',
    timerAddTime: 'Add time',
    timerCustom: 'Custom',
    timerSet: 'Set',
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
