import { Lang, Recipe, RecipeSummary } from '../app/recipe.model';

/** Testdata in het formaat van de backend-API. */
export const RECIPE_FIXTURES: Record<Lang, Recipe> = {
  nl: {
    id: 'curry-kikkererwten',
    title: 'Romige curry met kikkererwten',
    category: 'main',
    tags: ['vegetarisch', 'curry'],
    minutes: 45,
    servings: 4,
    ingredients: [
      { amount: 240, unit: 'g', name: 'Kikkererwten (blik, uitgelekt)', group: 'Curry', optional: false },
      { amount: 2, unit: 'stuk', name: 'Rode paprika', group: 'Curry', optional: false },
      { amount: 1, unit: 'stuk', name: 'Ui', group: 'Curry', optional: false },
      { amount: 400, unit: 'ml', name: 'Kokosmelk', group: 'Curry', optional: false },
      { amount: 280, unit: 'g', name: 'Basmatirijst', group: 'Rijst', optional: false },
      { amount: 15, unit: 'g', name: 'Verse koriander', group: 'Rijst', optional: true },
      { amount: null, unit: null, name: 'Zout en peper', group: 'Curry', optional: false },
    ],
    steps: [
      { text: 'Kook de rijst in ongeveer 12 minuten gaar.', group: 'Rijst', timerMinutes: 12 },
      { text: 'Bak de ui glazig en voeg de paprika toe.', group: 'Curry' },
      { text: 'Voeg kikkererwten en kokosmelk toe en laat 20 minuten sudderen.', group: 'Curry', timerMinutes: 20 },
    ],
    notes: ['Lekker met verse koriander.'],
  },
  en: {
    id: 'curry-kikkererwten',
    title: 'Creamy chickpea curry',
    category: 'main',
    tags: ['vegetarian', 'curry'],
    minutes: 45,
    servings: 4,
    ingredients: [
      { amount: 240, unit: 'g', name: 'Chickpeas (tin, drained)', group: 'Curry', optional: false },
      { amount: 2, unit: 'piece', name: 'Red bell pepper', group: 'Curry', optional: false },
      { amount: 1, unit: 'piece', name: 'Onion', group: 'Curry', optional: false },
      { amount: 400, unit: 'ml', name: 'Coconut milk', group: 'Curry', optional: false },
      { amount: 280, unit: 'g', name: 'Basmati rice', group: 'Rice', optional: false },
      { amount: 15, unit: 'g', name: 'Fresh coriander', group: 'Rice', optional: true },
      { amount: null, unit: null, name: 'Salt and pepper', group: 'Curry', optional: false },
    ],
    steps: [
      { text: 'Cook the rice for about 12 minutes.', group: 'Rice', timerMinutes: 12 },
      { text: 'Fry the onion until translucent and add the pepper.', group: 'Curry' },
      { text: 'Add the chickpeas and coconut milk and simmer for 20 minutes.', group: 'Curry', timerMinutes: 20 },
    ],
    notes: ['Lovely with fresh coriander.'],
  },
};

/** Recept zoals een deel van de echte data eruit ziet: geen aantal personen, minuten of hoeveelheden. */
export const RECIPE_SPARSE: Recipe = {
  id: 'sparse',
  title: 'Appeltaart',
  category: 'sweet',
  tags: [],
  minutes: null,
  servings: null,
  ingredients: [
    { amount: null, unit: null, name: '250 g bloem', group: null, optional: false },
    { amount: 3, unit: 'stuk', name: 'appels', group: null, optional: false },
  ],
  steps: [{ text: 'Bak de taart.', group: null }],
  notes: [],
};

export function toSummary(recipe: Recipe): RecipeSummary {
  const { id, title, category, tags, minutes, servings } = recipe;
  return { id, title, category, tags, minutes, servings };
}
