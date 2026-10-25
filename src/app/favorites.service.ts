import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

export type FavoriteResult = 'added' | 'removed' | 'error';

const STORAGE_KEY = 'recipes.favorites';
/** Een bezoeker kan nooit meer favorieten hebben dan er recepten zijn; dit houdt de opslag klein bij vervuilde data. */
const MAX_LOCAL = 500;

/**
 * Favorieten. De beheerder (Roy) bewaart ze in de backend (`/api/recipes/favorites`); alle andere bezoekers
 * bewaren ze alleen in de eigen browser (`localStorage`, zonder login en zonder dat er iets naar de server gaat).
 */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly serverIds = signal<readonly string[]>([]);
  private readonly localIds = signal<readonly string[]>(readLocal());
  readonly ids = computed(() => (this.auth.admin() ? this.serverIds() : this.localIds()));

  constructor() {
    effect(() => {
      const admin = this.auth.admin();
      untracked(() => (admin ? void this.load() : this.serverIds.set([])));
    });
  }

  isFavorite(id: string): boolean {
    return this.ids().includes(id);
  }

  /** Zet de favoriet om en zet hem in de backend; bij een fout wordt de wijziging teruggedraaid. */
  async toggle(id: string): Promise<FavoriteResult> {
    const before = this.ids();
    const on = !before.includes(id);
    const after = on ? [...before, id] : before.filter((x) => x !== id);
    if (!this.auth.admin()) {
      this.localIds.set(after);
      return writeLocal(after) ? (on ? 'added' : 'removed') : 'error';
    }
    this.serverIds.set(after);
    const url = `/api/recipes/favorites/${encodeURIComponent(id)}`;
    const options = { headers: { 'X-CSRF-Token': this.auth.csrfToken() } };
    try {
      await firstValueFrom(on ? this.http.put(url, null, options) : this.http.delete(url, options));
      return on ? 'added' : 'removed';
    } catch {
      this.serverIds.set(before);
      return 'error';
    }
  }

  private async load(): Promise<void> {
    try {
      this.serverIds.set(await firstValueFrom(this.http.get<string[]>('/api/recipes/favorites')));
    } catch {
      this.serverIds.set([]);
    }
  }
}

function readLocal(): readonly string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string').slice(0, MAX_LOCAL) : [];
  } catch {
    return [];
  }
}

/** Geeft false als de browser opslaan weigert (privémodus, vol, uitgezet); de ster blijft dan wel in dit venster staan. */
function writeLocal(ids: readonly string[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}
