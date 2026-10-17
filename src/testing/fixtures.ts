import { Lang, Recipe } from '../app/recipe.model';

/** Testdata in het formaat van de backend-API. */
export const RECIPE_FIXTURES: Record<Lang, Recipe> = {
  nl: {
    id: 'voorbeeld-curry',
    title: 'Romige curry met kikkererwten en groenten',
    description:
      'Een vegetarische doordeweekse curry met zachte kikkererwten, paprika en spinazie in kokosmelk. Lekker met basmatirijst en verse koriander.',
    difficulty: 'Makkelijk',
    minutes: 45,
    servings: 4,
    ingredients: [
      { name: 'Kikkererwten (blik, uitgelekt)', quantity: 240, unit: 'g' },
      { name: 'Rode paprika', quantity: 2, unit: 'stuk', unitPlural: 'stuks' },
      { name: 'Courgette', quantity: 1, unit: 'stuk', unitPlural: 'stuks' },
      { name: 'Ui', quantity: 1, unit: 'stuk', unitPlural: 'stuks' },
      { name: 'Knoflook', quantity: 2, unit: 'teen', unitPlural: 'tenen' },
      { name: 'Verse gember', quantity: 20, unit: 'g' },
      { name: 'Gele currypasta', quantity: 2, unit: 'el' },
      { name: 'Kokosmelk', quantity: 400, unit: 'ml' },
      { name: 'Verse spinazie', quantity: 100, unit: 'g' },
      { name: 'Basmatirijst', quantity: 280, unit: 'g' },
      { name: 'Limoen', quantity: 0.5, unit: 'stuk', unitPlural: 'stuks' },
      { name: 'Verse koriander', quantity: 15, unit: 'g' },
      { name: 'Zout en peper', quantity: null, unit: '', note: 'naar smaak' },
    ],
    steps: [
      { text: 'Kook de rijst volgens de verpakking in ongeveer 12 minuten gaar. Laat afgedekt staan tot het eten klaar is.' },
      { text: 'Snipper de ui, snijd de paprika en courgette in blokjes en rasp de knoflook en gember. Laat de kikkererwten uitlekken en spoel ze af.' },
      { text: 'Bak de ui in een beetje olie glazig. Voeg knoflook, gember en currypasta toe en bak 1 minuut mee.' },
      { text: 'Roerbak de paprika en courgette 8 minuten op middelhoog vuur, tot ze net zacht worden.' },
      { text: 'Voeg kikkererwten en kokosmelk toe, breng aan de kook en laat zachtjes sudderen. Roer af en toe.' },
      { text: 'Roer de spinazie erdoor tot hij geslonken is. Breng op smaak met zout, peper en een scheutje limoensap. Serveer met rijst en koriander.' },
    ],
  },
  en: {
    id: 'voorbeeld-curry',
    title: 'Creamy chickpea and vegetable curry',
    description:
      'A vegetarian weeknight curry with tender chickpeas, bell pepper and spinach in coconut milk. Lovely with basmati rice and fresh coriander.',
    difficulty: 'Easy',
    minutes: 45,
    servings: 4,
    ingredients: [
      { name: 'Chickpeas (tin, drained)', quantity: 240, unit: 'g' },
      { name: 'Red bell pepper', quantity: 2, unit: 'piece', unitPlural: 'pieces' },
      { name: 'Courgette', quantity: 1, unit: 'piece', unitPlural: 'pieces' },
      { name: 'Onion', quantity: 1, unit: 'piece', unitPlural: 'pieces' },
      { name: 'Garlic', quantity: 2, unit: 'clove', unitPlural: 'cloves' },
      { name: 'Fresh ginger', quantity: 20, unit: 'g' },
      { name: 'Yellow curry paste', quantity: 2, unit: 'tbsp' },
      { name: 'Coconut milk', quantity: 400, unit: 'ml' },
      { name: 'Fresh spinach', quantity: 100, unit: 'g' },
      { name: 'Basmati rice', quantity: 280, unit: 'g' },
      { name: 'Lime', quantity: 0.5, unit: 'piece', unitPlural: 'pieces' },
      { name: 'Fresh coriander', quantity: 15, unit: 'g' },
      { name: 'Salt and pepper', quantity: null, unit: '', note: 'to taste' },
    ],
    steps: [
      { text: 'Cook the rice according to the packet, about 12 minutes. Keep it covered until the meal is ready.' },
      { text: 'Chop the onion, dice the pepper and courgette and grate the garlic and ginger. Drain and rinse the chickpeas.' },
      { text: 'Fry the onion in a little oil until translucent. Add garlic, ginger and curry paste and fry for 1 minute.' },
      { text: 'Stir-fry the pepper and courgette for 8 minutes over medium heat, until just tender.' },
      { text: 'Add the chickpeas and coconut milk, bring to the boil and simmer gently. Stir now and then.' },
      { text: 'Stir in the spinach until wilted. Season with salt, pepper and a splash of lime juice. Serve with rice and coriander.' },
    ],
  },
};
