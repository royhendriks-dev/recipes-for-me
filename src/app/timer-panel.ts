import { Component, inject, signal } from '@angular/core';
import { I18nService } from './i18n.service';
import { KitchenTimer, TimerService } from './timer.service';

const ADD_MINUTES = [1, 5];
const DEFAULT_SEC = 300;
/** Omtrek van de voortgangsring (2 * pi * 42). */
const CIRCUMFERENCE = 264;

@Component({
  selector: 'app-timer-panel',
  templateUrl: './timer-panel.html',
  styleUrl: './timer-panel.scss',
})
export class TimerPanel {
  protected readonly i18n = inject(I18nService);
  protected readonly timerService = inject(TimerService);
  protected readonly addMinutes = ADD_MINUTES;
  protected readonly circumference = CIRCUMFERENCE;
  /** Id van de timer waarvan de naam nu wordt bewerkt. */
  protected readonly editing = signal<number | null>(null);

  protected addTimer(): void {
    this.timerService.add(this.i18n.t('timerDefaultName'), DEFAULT_SEC);
  }

  protected format(timer: KitchenTimer): string {
    const left = this.timerService.leftSec(timer);
    const mm = String(Math.floor(left / 60)).padStart(2, '0');
    const ss = String(left % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  protected status(timer: KitchenTimer): string {
    if (this.timerService.isDone(timer)) {
      return this.i18n.t('timerTimeUp');
    }
    if (this.timerService.isRunning(timer)) {
      return this.i18n.t('timerRunning');
    }
    return this.i18n.t(timer.started ? 'timerPaused' : 'timerIdle');
  }

  /** Streepjesafstand van de ring: vol bij het begin, leeg als de tijd om is. */
  protected offset(timer: KitchenTimer): number {
    const fraction = Math.min(1, Math.max(0, this.timerService.leftSec(timer) / timer.totalSec));
    return CIRCUMFERENCE * (1 - fraction);
  }

  protected saveName(timer: KitchenTimer, value: string): void {
    this.timerService.rename(timer.id, value.trim() || this.i18n.t('timerDefaultName'));
    this.editing.set(null);
  }

  /**
   * Starten pakt een ingevulde tijd meteen (en leegt de velden); zonder invoer start of hervat hij de
   * ingestelde tijd, en een afgelopen timer begint opnieuw. Tijdens het lopen pauzeert de knop alleen.
   */
  protected startOrPause(timer: KitchenTimer, min: HTMLInputElement, sec: HTMLInputElement): void {
    if (!this.timerService.isRunning(timer)) {
      const typed = (Number(min.value) || 0) * 60 + (Number(sec.value) || 0);
      if (typed > 0) {
        this.timerService.setDuration(timer.id, typed);
        min.value = '';
        sec.value = '';
      } else if (this.timerService.isDone(timer)) {
        this.timerService.reset(timer.id);
      }
    }
    this.timerService.toggle(timer.id);
  }
}
