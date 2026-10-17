export type Lang = 'nl' | 'en';

export type Category = 'main' | 'side' | 'sweet';

/** Zoals de backend het levert (royhendriks-dev/portfolio, backend/README.md). */
export interface Ingredient {
  /** Hoeveelheid voor `Recipe.servings` personen; null = geen hoeveelheid (de hele regel staat in `name`). */
  amount: number | null;
  unit: string | null;
  name: string;
  group: string | null;
  optional: boolean;
}

export interface RecipeStep {
  text: string;
  group: string | null;
  /** Voorstel, nog niet in de backend: bij deze stap hoort een timer van zoveel minuten. */
  timerMinutes?: number;
}

/** Een regel in de receptenlijst. `minutes` en `servings` kunnen leeg zijn. */
export interface RecipeSummary {
  id: string;
  title: string;
  category: Category;
  tags: string[];
  minutes: number | null;
  servings: number | null;
}

export interface Recipe extends RecipeSummary {
  ingredients: Ingredient[];
  steps: RecipeStep[];
  notes: string[];
}

export interface Group<T> {
  name: string | null;
  items: { item: T; index: number }[];
}

/** Groepeert opeenvolgende items met dezelfde groepsnaam; `index` is de plek in de oorspronkelijke lijst. */
export function groupItems<T extends { group: string | null }>(items: T[]): Group<T>[] {
  const groups: Group<T>[] = [];
  items.forEach((item, index) => {
    const last = groups[groups.length - 1];
    if (last && last.name === item.group) {
      last.items.push({ item, index });
    } else {
      groups.push({ name: item.group, items: [{ item, index }] });
    }
  });
  return groups;
}
