import { Injectable, signal } from '@angular/core';

export interface KitchenTimer {
  id: number;
  name: string;
  totalSec: number;
  /** Eindtijd in ms zolang de timer loopt; null bij pauze of als hij klaar is. */
  endsAt: number | null;
  /** Resterende seconden zolang de timer niet loopt. */
  pausedLeftSec: number;
}

/**
 * Keukentimers. Rekent op een eindtijd (niet op het aantal ticks), zodat de tijd klopt als de
 * tab op de achtergrond stond of het scherm even uit was.
 */
@Injectable({ providedIn: 'root' })
export class TimerService {
  readonly timers = signal<KitchenTimer[]>([]);
  readonly now = signal(Date.now());
  /** Naam van de laatst afgelopen timer; het scherm leest dit voor via een live-regio. */
  readonly finished = signal('');

  private nextId = 1;
  private interval: ReturnType<typeof setInterval> | undefined;
  private wakeLock: WakeLockSentinel | null = null;

  start(name: string, totalSec: number): void {
    const sec = Math.max(1, Math.round(totalSec));
    this.timers.update((all) => [
      ...all,
      { id: this.nextId++, name, totalSec: sec, endsAt: Date.now() + sec * 1000, pausedLeftSec: sec },
    ]);
    this.sync();
  }

  leftSec(timer: KitchenTimer): number {
    return timer.endsAt === null ? timer.pausedLeftSec : Math.max(0, Math.ceil((timer.endsAt - this.now()) / 1000));
  }

  isRunning(timer: KitchenTimer): boolean {
    return timer.endsAt !== null;
  }

  isDone(timer: KitchenTimer): boolean {
    return timer.endsAt === null && timer.pausedLeftSec <= 0;
  }

  toggle(id: number): void {
    this.change(id, (t) =>
      t.endsAt === null
        ? { ...t, endsAt: Date.now() + t.pausedLeftSec * 1000 }
        : { ...t, pausedLeftSec: this.leftSec(t), endsAt: null },
    );
  }

  addMinute(id: number): void {
    this.change(id, (t) => ({
      ...t,
      totalSec: t.totalSec + 60,
      endsAt: t.endsAt === null ? null : t.endsAt + 60_000,
      pausedLeftSec: t.pausedLeftSec + 60,
    }));
  }

  remove(id: number): void {
    this.timers.update((all) => all.filter((t) => t.id !== id));
    this.sync();
  }

  private change(id: number, fn: (timer: KitchenTimer) => KitchenTimer): void {
    this.timers.update((all) => all.map((t) => (t.id === id && !this.isDone(t) ? fn(t) : t)));
    this.sync();
  }

  private tick(): void {
    const now = Date.now();
    this.now.set(now);
    for (const timer of this.timers()) {
      if (timer.endsAt !== null && timer.endsAt <= now) {
        this.timers.update((all) => all.map((t) => (t.id === timer.id ? { ...t, endsAt: null, pausedLeftSec: 0 } : t)));
        this.finished.set(timer.name);
        navigator.vibrate?.([300, 150, 300]);
      }
    }
    this.sync();
  }

  /** Houdt de interval en het scherm-aan-slot alleen aan zolang er een timer loopt. */
  private sync(): void {
    const running = this.timers().some((t) => t.endsAt !== null);
    if (running && this.interval === undefined) {
      this.now.set(Date.now());
      this.interval = setInterval(() => this.tick(), 1000);
    } else if (!running && this.interval !== undefined) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    if (running) {
      void this.acquireWakeLock();
    } else {
      void this.releaseWakeLock();
    }
  }

  private async acquireWakeLock(): Promise<void> {
    if (this.wakeLock || !('wakeLock' in navigator)) {
      return;
    }
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => (this.wakeLock = null));
    } catch {
      // niet toegestaan (bijv. batterijbesparing): timers werken gewoon door
    }
  }

  private async releaseWakeLock(): Promise<void> {
    await this.wakeLock?.release();
    this.wakeLock = null;
  }
}
