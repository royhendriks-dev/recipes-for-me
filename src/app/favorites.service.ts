import { Injectable, signal } from '@angular/core';

export type FavoriteResult = 'added' | 'removed' | 'error';

const STORAGE_KEY = 'recipes.favorites';
/** Een bezoeker kan nooit meer favorieten hebben dan er recepten zijn; dit houdt de opslag klein bij vervuilde data. */
const MAX_LOCAL = 500;

/**
 * Favorieten van de bezoeker. Ze staan alleen in de eigen browser (`localStorage`, zonder login en zonder dat er
 * iets naar de server gaat).
 */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly localIds = signal<readonly string[]>(readLocal());
  readonly ids = this.localIds.asReadonly();

  isFavorite(id: string): boolean {
    return this.ids().includes(id);
  }

  /** Zet de favoriet om; geeft 'error' als de browser opslaan weigert. */
  async toggle(id: string): Promise<FavoriteResult> {
    const before = this.ids();
    const on = !before.includes(id);
    const after = on ? [...before, id] : before.filter((x) => x !== id);
    this.localIds.set(after);
    return writeLocal(after) ? (on ? 'added' : 'removed') : 'error';
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
