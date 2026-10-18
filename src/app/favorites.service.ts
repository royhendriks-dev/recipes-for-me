import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

export type FavoriteResult = 'added' | 'removed' | 'error';

/** Favorieten van de beheerder, bewaard in de backend (`/api/recipes/favorites`). Zonder login blijft de lijst leeg. */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  readonly ids = signal<readonly string[]>([]);

  constructor() {
    effect(() => {
      const admin = this.auth.admin();
      untracked(() => (admin ? void this.load() : this.ids.set([])));
    });
  }

  isFavorite(id: string): boolean {
    return this.ids().includes(id);
  }

  /** Zet de favoriet om en zet hem in de backend; bij een fout wordt de wijziging teruggedraaid. */
  async toggle(id: string): Promise<FavoriteResult> {
    const before = this.ids();
    const on = !before.includes(id);
    this.ids.set(on ? [...before, id] : before.filter((x) => x !== id));
    const url = `/api/recipes/favorites/${encodeURIComponent(id)}`;
    const options = { headers: { 'X-CSRF-Token': this.auth.csrfToken() } };
    try {
      await firstValueFrom(on ? this.http.put(url, null, options) : this.http.delete(url, options));
      return on ? 'added' : 'removed';
    } catch {
      this.ids.set(before);
      return 'error';
    }
  }

  private async load(): Promise<void> {
    try {
      this.ids.set(await firstValueFrom(this.http.get<string[]>('/api/recipes/favorites')));
    } catch {
      this.ids.set([]);
    }
  }
}
