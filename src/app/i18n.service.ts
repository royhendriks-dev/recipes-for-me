import { Injectable, computed, effect, signal } from '@angular/core';
import { Lang } from './recipe.model';
import { TRANSLATIONS, TranslationKey } from './translations';

const STORAGE_KEY = 'recipes.lang';

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

  constructor() {
    effect(() => {
      const lang = this.lang();
      document.documentElement.lang = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // opslag niet beschikbaar (bijv. privé-modus): taal blijft alleen in het geheugen
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
