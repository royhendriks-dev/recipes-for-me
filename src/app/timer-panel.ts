import { Component, inject } from '@angular/core';
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
  protected readonly Math = Math;

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

  protected rename(timer: KitchenTimer, event: Event): void {
    this.timerService.rename(timer.id, (event.target as HTMLInputElement).value);
  }

  protected setCustom(timer: KitchenTimer, minutes: string, seconds: string): void {
    this.timerService.setDuration(timer.id, (Number(minutes) || 0) * 60 + (Number(seconds) || 0));
  }
}
