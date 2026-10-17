import { Injectable, computed, effect, signal } from '@angular/core';
import { Lang } from './recipe.model';
import { TRANSLATIONS, TranslationKey } from './translations';

/** Zelfde sleutel als het portfolio (zelfde origin), zodat de app de taal van het portfolio volgt. */
const STORAGE_KEY = 'lang';

function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function readStoredLang(): Lang | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'nl' || value === 'en' ? value : null;
  } catch {
    return null;
  }
}

function detectLang(): Lang {
  const stored = readStoredLang();
  if (stored) {
    return stored;
  }
  return (navigator.language ?? 'nl').toLowerCase().startsWith('en') ? 'en' : 'nl';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(detectLang());
  readonly otherLang = computed<Lang>(() => (this.lang() === 'nl' ? 'en' : 'nl'));
  /** In het portfolio (iframe) bepaalt de NL/EN-knop daar de taal; los draaiend houdt de app een eigen knop. */
  readonly embedded = isEmbedded();

  constructor() {
    effect(() => {
      const lang = this.lang();
      document.documentElement.lang = lang;
      if (this.embedded) {
        return;
      }
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // opslag niet beschikbaar (bijv. privé-modus): taal blijft alleen in het geheugen
      }
    });
    // Het portfolio schrijft de gekozen taal naar localStorage; de storage-event bereikt dit iframe direct.
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY && (event.newValue === 'nl' || event.newValue === 'en')) {
        this.lang.set(event.newValue);
      }
    });
  }

  t(key: TranslationKey): string {
    return TRANSLATIONS[this.lang()][key];
  }

  toggle(): void {
    this.lang.set(this.otherLang());
  }
}
