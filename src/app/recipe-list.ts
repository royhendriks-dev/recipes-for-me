import { Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from './i18n.service';
import { RecipeService } from './recipe.service';

@Component({
  imports: [RouterLink],
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.scss',
})
export class RecipeList {
  protected readonly i18n = inject(I18nService);
  private readonly recipes = inject(RecipeService);

  protected readonly list = resource({
    params: () => this.i18n.lang(),
    loader: ({ params }) => this.recipes.list(params),
  });
}
