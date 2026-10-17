import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, resource, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from './i18n.service';
import { formatQuantity } from './quantity';
import { groupItems } from './recipe.model';
import { RecipeService } from './recipe.service';
import { TimerService } from './timer.service';
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
  private readonly timers = inject(TimerService);

  /** Komt uit de route (`recept/:id`). */
  readonly id = input.required<string>();

  protected readonly recipe = resource({
    params: () => ({ id: this.id(), lang: this.i18n.lang() }),
    loader: ({ params }) => this.recipes.get(params.id, params.lang),
  });

  /** Het recept zodra het geladen is (lees `recipe.value()` niet rechtstreeks: dat gooit bij een fout). */
  protected readonly current = computed(() => (this.recipe.hasValue() ? this.recipe.value() : undefined));
  protected readonly ingredientGroups = computed(() => groupItems(this.current()?.ingredients ?? []));
  protected readonly stepGroups = computed(() => groupItems(this.current()?.steps ?? []));
  protected readonly notFound = computed(() => {
    const error: unknown = this.recipe.error();
    const failure = error instanceof HttpErrorResponse ? error : (error as { cause?: unknown } | undefined)?.cause;
    return failure instanceof HttpErrorResponse && failure.status === 404;
  });

  /** Aantal personen voor de slider (1-4); null als het recept er geen heeft: dan wordt niet geschaald. */
  protected readonly servings = signal<number | null>(null);
  protected readonly checked = signal<ReadonlySet<number>>(new Set());
  protected readonly favorites = signal<string[]>(readFavorites());
  protected readonly toast = signal('');
  protected readonly fallbackText = signal('');
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    // Begin bij het aantal personen van het recept (de slider gaat van 1 tot 4).
    effect(() => {
      const recipe = this.current();
      if (recipe) {
        untracked(() => this.servings.set(recipe.servings === null ? null : Math.min(4, Math.max(1, recipe.servings))));
      }
    });
  }

  protected readonly isFavorite = computed(() => {
    const recipe = this.current();
    return !!recipe && this.favorites().includes(recipe.id);
  });

  protected readonly servingsLabel = computed(() => {
    const servings = this.servings();
    return servings === null ? '' : this.servingsText(servings);
  });

  protected servingsText(count: number): string {
    return `${count} ${this.i18n.t(count === 1 ? 'person' : 'people')}`;
  }

  protected quantity(index: number): string {
    const recipe = this.current();
    return recipe ? formatQuantity(recipe.ingredients[index], this.servings(), recipe.servings, this.i18n.lang()) : '';
  }

  protected setServings(event: Event): void {
    this.servings.set(Number((event.target as HTMLInputElement).value));
  }

  protected startTimer(stepNumber: number, minutes: number): void {
    this.timers.start(`${this.current()?.title ?? ''} ${this.i18n.t('steps')} ${stepNumber}`.trim(), minutes * 60);
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
    const recipe = this.current();
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
    const recipe = this.current();
    if (!recipe) {
      return;
    }
    const text = buildShareText(
      recipe,
      this.servings(),
      {
        intro: this.i18n.t('shareIntro'),
        introPlain: this.i18n.t('shareIntroPlain'),
        personsLabel: this.i18n.t(this.servings() === 1 ? 'person' : 'people'),
        optional: this.i18n.t('optional'),
      },
      this.i18n.lang(),
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
