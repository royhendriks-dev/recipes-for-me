import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Lang } from './recipe.model';

export type DiscordShareResult = 'sent' | 'rate_limited' | 'disconnected' | 'not_connected' | 'error';
export type DiscordNotice = 'connected' | 'denied' | 'limit' | 'error';

const NOTICES: readonly string[] = ['connected', 'denied', 'limit', 'error'];

/** Leest `?discord=...` (waar de backend de bezoeker na Discord naartoe stuurt) en haalt het uit de adresbalk. */
function takeNotice(): DiscordNotice | null {
  try {
    const url = new URL(window.location.href);
    const value = url.searchParams.get('discord');
    if (value === null) {
      return null;
    }
    url.searchParams.delete('discord');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    return NOTICES.includes(value) ? (value as DiscordNotice) : null;
  } catch {
    return null;
  }
}

/**
 * Recepten naar de eigen Discord-server van de bezoeker, zonder inlog op de site. De backend (`/api/discord/*` in
 * royhendriks-dev/portfolio) bewaart de webhook; de browser heeft alleen een HttpOnly-cookie en kent de webhook zelf
 * nooit. Koppelen gebeurt in een nieuw tabblad (Discord staat geen iframe toe) en we kijken opnieuw als dit tabblad
 * weer focus krijgt.
 */
@Injectable({ providedIn: 'root' })
export class DiscordService {
  private readonly http = inject(HttpClient);

  /** Staat de koppeling aan op de server (client id en sleutel ingesteld)? */
  readonly enabled = signal(false);
  readonly connected = signal(false);
  /** Melding na terugkomst van Discord; de app toont hem één keer. */
  readonly notice = signal<DiscordNotice | null>(takeNotice());
  readonly connectUrl = '/api/discord/connect';
  private listening = false;

  /** Haalt de status op en blijft hem bijhouden zodra de bezoeker terugkomt in dit tabblad. */
  async refresh(): Promise<void> {
    if (!this.listening) {
      this.listening = true;
      window.addEventListener('focus', () => void this.load());
      document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && void this.load());
    }
    await this.load();
  }

  async share(recipe: string, lang: Lang, servings: number | null): Promise<DiscordShareResult> {
    try {
      await firstValueFrom(this.http.post('/api/discord/share', { recipe, lang, servings }));
      return 'sent';
    } catch (error) {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      if (status === 401 || status === 410) {
        this.connected.set(false);
        return status === 401 ? 'not_connected' : 'disconnected';
      }
      return status === 429 ? 'rate_limited' : 'error';
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete('/api/discord/link'));
      this.connected.set(false);
      return true;
    } catch {
      return false;
    }
  }

  dismissNotice(): void {
    this.notice.set(null);
  }

  private async load(): Promise<void> {
    try {
      const status = await firstValueFrom(this.http.get<{ enabled: boolean; connected: boolean }>('/api/discord/status'));
      this.enabled.set(status.enabled === true);
      this.connected.set(status.enabled === true && status.connected === true);
    } catch {
      this.enabled.set(false);
      this.connected.set(false);
    }
  }
}
