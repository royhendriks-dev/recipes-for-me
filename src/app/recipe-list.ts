import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesService } from './favorites.service';
import { I18nService } from './i18n.service';
import { Category, RecipeSummary } from './recipe.model';
import { RecipeService } from './recipe.service';

export const CATEGORIES: Category[] = ['main', 'side', 'sweet'];

@Component({
  imports: [RouterLink, NgTemplateOutlet],
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.scss',
})
export class RecipeList {
  protected readonly i18n = inject(I18nService);
  private readonly recipes = inject(RecipeService);
  private readonly favorites = inject(FavoritesService);

  protected readonly categories = CATEGORIES;
  protected readonly filter = signal<Category | null>(null);

  protected readonly list = resource({
    params: () => this.i18n.lang(),
    loader: ({ params }) => this.recipes.list(params),
  });

  /** Recepten per soort gerecht, in vaste volgorde; lege soorten (of niet gekozen door het filter) vallen weg. */
  protected readonly sections = computed(() => {
    const all = this.list.value() ?? [];
    const chosen = this.filter();
    return CATEGORIES.filter((category) => !chosen || chosen === category)
      .map((category) => ({ category, recipes: all.filter((recipe: RecipeSummary) => recipe.category === category) }))
      .filter((section) => section.recipes.length > 0);
  });

  /** Favorieten bovenaan, in de volgorde van de lijst; bezoekers zien hun eigen (lokale) favorieten. */
  protected readonly favoriteRecipes = computed(() => {
    const chosen = this.filter();
    return (this.list.value() ?? []).filter(
      (recipe: RecipeSummary) => this.favorites.isFavorite(recipe.id) && (!chosen || chosen === recipe.category),
    );
  });

  protected isFavorite(id: string): boolean {
    return this.favorites.isFavorite(id);
  }
}
