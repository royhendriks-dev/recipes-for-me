import { Component, inject, signal } from '@angular/core';
import { I18nService } from './i18n.service';
import { KitchenTimer, TimerService } from './timer.service';

const PRESET_MINUTES = [5, 10, 15];

@Component({
  selector: 'app-timer-panel',
  templateUrl: './timer-panel.html',
  styleUrl: './timer-panel.scss',
})
export class TimerPanel {
  protected readonly i18n = inject(I18nService);
  protected readonly timerService = inject(TimerService);
  protected readonly presets = PRESET_MINUTES;
  protected readonly adding = signal(false);

  protected format(timer: KitchenTimer): string {
    const left = this.timerService.leftSec(timer);
    const mm = String(Math.floor(left / 60)).padStart(2, '0');
    const ss = String(left % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  protected progress(timer: KitchenTimer): number {
    return Math.min(100, Math.max(0, (1 - this.timerService.leftSec(timer) / timer.totalSec) * 100));
  }

  protected startCustom(name: string, minutes: string, seconds: string): void {
    const total = (Number(minutes) || 0) * 60 + (Number(seconds) || 0);
    if (total > 0) {
      this.timerService.start(name.trim() || this.i18n.t('timerDefaultName'), total);
      this.adding.set(false);
    }
  }
}
