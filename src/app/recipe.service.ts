import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Lang, Recipe, RecipeSummary } from './recipe.model';

/**
 * Haalt recepten op bij de backend (royhendriks-dev/portfolio) op dezelfde origin.
 * Bewust een absoluut pad: de app draait onder /apps/recipes/, de API onder /api/.
 */
@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);

  list(lang: Lang): Promise<RecipeSummary[]> {
    return firstValueFrom(this.http.get<RecipeSummary[]>('/api/recipes', { params: { lang } }));
  }

  get(id: string, lang: Lang): Promise<Recipe> {
    return firstValueFrom(this.http.get<Recipe>(`/api/recipes/${encodeURIComponent(id)}`, { params: { lang } }));
  }
}
