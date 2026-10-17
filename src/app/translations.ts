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
  | 'copied'
  | 'copyFailed'
  | 'ingredientsAsText'
  | 'steps'
  | 'loading'
  | 'error'
  | 'retry';

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
    copied: 'Lijst gekopieerd naar het klembord',
    copyFailed: 'Kopiëren lukte niet. Selecteer de tekst hieronder en kopieer die zelf.',
    ingredientsAsText: 'Ingrediëntenlijst als tekst',
    steps: 'Bereiding',
    loading: 'Recept laden…',
    error: 'Het recept kon niet worden geladen.',
    retry: 'Opnieuw proberen',
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
    copied: 'List copied to the clipboard',
    copyFailed: 'Copying failed. Select the text below and copy it yourself.',
    ingredientsAsText: 'Ingredient list as text',
    steps: 'Method',
    loading: 'Loading recipe…',
    error: 'The recipe could not be loaded.',
    retry: 'Try again',
  },
};
