import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, resource, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { DiscordService } from './discord.service';
import { FavoritesService } from './favorites.service';
import { I18nService } from './i18n.service';
import { formatQuantity } from './quantity';
import { groupItems } from './recipe.model';
import { RecipeService } from './recipe.service';
import { TimerService } from './timer.service';
import { buildShareText } from './share';

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
  private readonly favoritesService = inject(FavoritesService);
  protected readonly discord = inject(DiscordService);
  /** De favorietenster is alleen voor de ingelogde beheerder; delen kan iedereen. */
  protected readonly admin = inject(AuthService).admin;

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

  /** Aantal personen voor de slider (2 of 4); null als het recept er geen heeft: dan wordt niet geschaald. */
  protected readonly servings = signal<number | null>(null);
  protected readonly checked = signal<ReadonlySet<number>>(new Set());
  protected readonly toast = signal('');
  protected readonly fallbackText = signal('');
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    void this.discord.refresh();
    // Begin bij het aantal personen van het recept (de slider kent alleen 2 en 4).
    effect(() => {
      const recipe = this.current();
      if (recipe) {
        untracked(() => this.servings.set(recipe.servings === null ? null : recipe.servings >= 3 ? 4 : 2));
      }
    });
  }

  protected readonly isFavorite = computed(() => {
    const recipe = this.current();
    return !!recipe && this.favoritesService.ids().includes(recipe.id);
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

  protected async toggleFavorite(): Promise<void> {
    const recipe = this.current();
    if (!recipe) {
      return;
    }
    const result = await this.favoritesService.toggle(recipe.id);
    this.showToast(this.i18n.t(result === 'added' ? 'favoriteAdded' : result === 'removed' ? 'favoriteRemoved' : 'favoriteError'));
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

  protected async sendToDiscord(): Promise<void> {
    const recipe = this.current();
    if (!recipe) {
      return;
    }
    const result = await this.discord.share(recipe.id, this.i18n.lang(), this.servings());
    const messages = {
      sent: 'discordSent',
      rate_limited: 'discordRateLimited',
      disconnected: 'discordGone',
      not_connected: 'discordGone',
      error: 'discordError',
    } as const;
    this.showToast(this.i18n.t(messages[result]));
  }

  protected async disconnectDiscord(): Promise<void> {
    const done = await this.discord.disconnect();
    this.showToast(this.i18n.t(done ? 'discordDisconnected' : 'discordError'));
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
