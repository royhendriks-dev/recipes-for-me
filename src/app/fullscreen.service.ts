import { Injectable, signal } from '@angular/core';

/**
 * Volledig scherm voor de hele app. In het portfolio-iframe werkt dit alleen als het iframe
 * `allow="fullscreen"` heeft; anders meldt de browser dat het niet beschikbaar is en blijft de knop verborgen.
 */
@Injectable({ providedIn: 'root' })
export class FullscreenService {
  readonly supported = document.fullscreenEnabled === true;
  readonly active = signal(document.fullscreenElement != null);

  constructor() {
    document.addEventListener('fullscreenchange', () => this.active.set(document.fullscreenElement != null));
  }

  async toggle(): Promise<void> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // de browser weigerde (bijv. geen toestemming van het iframe): status blijft ongewijzigd
    }
  }
}
