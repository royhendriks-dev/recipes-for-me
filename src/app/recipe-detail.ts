import { Component, computed, effect, inject, input, resource, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from './i18n.service';
import { formatQuantity } from './quantity';
import { RecipeService } from './recipe.service';
import { buildShareText } from './share';

const FAVORITES_KEY = 'recipes.favorites';

function readFavorites(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    // opslag niet beschikbaar: favoriet geldt alleen tot de pagina sluit
  }
}

@Component({
  imports: [RouterLink],
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.scss',
})
export class RecipeDetail {
  protected readonly i18n = inject(I18nService);
  private readonly recipes = inject(RecipeService);

  /** Komt uit de route (`recept/:id`). */
  readonly id = input.required<string>();

  protected readonly recipe = resource({
    params: () => ({ id: this.id(), lang: this.i18n.lang() }),
    loader: ({ params }) => this.recipes.get(params.id, params.lang),
  });

  protected readonly servings = signal(4);
  protected readonly checked = signal<ReadonlySet<number>>(new Set());
  protected readonly favorites = signal<string[]>(readFavorites());
  protected readonly toast = signal('');
  protected readonly fallbackText = signal('');
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    // Begin bij het aantal personen van het recept (de slider gaat van 1 tot 4).
    effect(() => {
      const recipe = this.recipe.hasValue() ? this.recipe.value() : undefined;
      if (recipe) {
        untracked(() => this.servings.set(Math.min(4, Math.max(1, recipe.servings))));
      }
    });
  }

  protected readonly isFavorite = computed(() => {
    const recipe = this.recipe.hasValue() ? this.recipe.value() : undefined;
    return !!recipe && this.favorites().includes(recipe.id);
  });

  protected readonly servingsLabel = computed(() => this.servingsText(this.servings()));

  protected servingsText(count: number): string {
    return `${count} ${this.i18n.t(count === 1 ? 'person' : 'people')}`;
  }

  protected quantity(index: number): string {
    const recipe = this.recipe.value();
    return recipe ? formatQuantity(recipe.ingredients[index], this.servings(), recipe.servings) : '';
  }

  protected setServings(event: Event): void {
    this.servings.set(Number((event.target as HTMLInputElement).value));
  }

  protected toggleChecked(index: number): void {
    this.checked.update((current) => {
      const next = new Set(current);
      if (!next.delete(index)) {
        next.add(index);
      }
      return next;
    });
  }

  protected toggleFavorite(): void {
    const recipe = this.recipe.value();
    if (!recipe) {
      return;
    }
    const on = !this.isFavorite();
    const next = on ? [...this.favorites(), recipe.id] : this.favorites().filter((id) => id !== recipe.id);
    this.favorites.set(next);
    writeFavorites(next);
    this.showToast(this.i18n.t(on ? 'favoriteAdded' : 'favoriteRemoved'));
  }

  protected async share(): Promise<void> {
    const recipe = this.recipe.value();
    if (!recipe) {
      return;
    }
    const text = buildShareText(
      recipe,
      this.servings(),
      this.i18n.t('shareIntro'),
      this.i18n.t(this.servings() === 1 ? 'person' : 'people'),
    );
    if (navigator.share) {
      try {
        await navigator.share({ title: this.i18n.t('shareTitle'), text });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }
    await this.copy(text);
  }

  private async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.fallbackText.set('');
      this.showToast(this.i18n.t('copied'));
    } catch {
      this.fallbackText.set(text);
    }
  }

  private showToast(message: string): void {
    this.toast.set(message);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 2600);
  }
}
