import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/** Antwoord van `GET /api/auth/session` van de portfolio-backend (200 = ingelogd, 204 = niet). */
interface SessionInfo {
  username: string;
  roles: string[];
  csrfToken: string;
}

/**
 * Weet of de beheerder (Roy) is ingelogd in het portfolio. De app draait in een iframe op dezelfde origin,
 * dus het sessiecookie gaat vanzelf mee. Inloggen zelf gebeurt in het portfolio (Start > Inloggen);
 * deze app heeft geen eigen login en bewaart geen token in de browser.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<SessionInfo | null>(null);

  /** Alleen de beheerder ziet favorieten en de deelknop. */
  readonly admin = computed(() => this.session()?.roles.includes('admin') ?? false);

  constructor() {
    void this.refresh();
  }

  /** CSRF-token voor wijzigende verzoeken; leeg als niet ingelogd. */
  csrfToken(): string {
    return this.session()?.csrfToken ?? '';
  }

  async refresh(): Promise<void> {
    try {
      const session = await firstValueFrom(this.http.get<SessionInfo | null>('/api/auth/session'));
      this.session.set(session && Array.isArray(session.roles) ? session : null);
    } catch {
      this.session.set(null);
    }
  }
}
