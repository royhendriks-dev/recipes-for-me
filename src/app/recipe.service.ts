import { Injectable } from '@angular/core';
import { Lang, Recipe } from './recipe.model';
import { SAMPLE_RECIPES } from './sample-recipe';

/** Bron van recepten. Nu nog het ingebouwde voorbeeld; de backend-koppeling vervangt dit. */
@Injectable({ providedIn: 'root' })
export class RecipeService {
  async getRecipe(lang: Lang): Promise<Recipe> {
    return SAMPLE_RECIPES[lang];
  }
}
