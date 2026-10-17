export type Lang = 'nl' | 'en';

export interface Ingredient {
  name: string;
  /** Hoeveelheid voor `Recipe.servings` personen; null = "naar smaak". */
  quantity: number | null;
  unit: string;
  unitPlural?: string;
  note?: string;
}

export interface RecipeStep {
  text: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  minutes: number;
  servings: number;
  imageUrl?: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}
