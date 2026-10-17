import { Injectable, signal } from '@angular/core';

export interface KitchenTimer {
  id: number;
  name: string;
  totalSec: number;
  /** Ingestelde duur in seconden; Reset zet de timer hierop terug. */
  initialSec: number;
  /** Wordt true zodra de timer voor het eerst is gestart. */
  started: boolean;
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
  private audio: AudioContext | undefined;
  private wakeLock: WakeLockSentinel | null = null;

  /** Maakt een timer en laat hem meteen lopen. */
  start(name: string, totalSec: number): void {
    this.add(name, totalSec, true);
  }

  /** Maakt een timer; zonder `run` staat hij klaar om te starten. Geeft het id terug. */
  add(name: string, totalSec: number, run = false): number {
    const sec = Math.max(1, Math.round(totalSec));
    const id = this.nextId++;
    this.timers.update((all) => [
      ...all,
      { id, name, totalSec: sec, initialSec: sec, started: run, endsAt: run ? Date.now() + sec * 1000 : null, pausedLeftSec: sec },
    ]);
    this.sync();
    return id;
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
        ? { ...t, started: true, endsAt: Date.now() + t.pausedLeftSec * 1000 }
        : { ...t, pausedLeftSec: this.leftSec(t), endsAt: null },
    );
  }

  addMinutes(id: number, minutes: number): void {
    const extra = minutes * 60;
    this.change(id, (t) => ({
      ...t,
      totalSec: t.totalSec + extra,
      endsAt: t.endsAt === null ? null : t.endsAt + extra * 1000,
      pausedLeftSec: t.pausedLeftSec + extra,
    }));
  }

  /** Stelt een nieuwe duur in en zet de timer stil (ook als hij al klaar was). */
  setDuration(id: number, totalSec: number): void {
    const sec = Math.round(totalSec);
    if (sec < 1) {
      return;
    }
    this.timers.update((all) =>
      all.map((t) => (t.id === id ? { ...t, totalSec: sec, initialSec: sec, started: false, endsAt: null, pausedLeftSec: sec } : t)),
    );
    this.sync();
  }

  reset(id: number): void {
    this.timers.update((all) =>
      all.map((t) => (t.id === id ? { ...t, totalSec: t.initialSec, started: false, endsAt: null, pausedLeftSec: t.initialSec } : t)),
    );
    this.sync();
  }

  rename(id: number, name: string): void {
    this.timers.update((all) => all.map((t) => (t.id === id ? { ...t, name } : t)));
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
        this.beep();
      }
    }
    this.sync();
  }

  /** Korte pieptoon (twee keer) via Web Audio; stil als de browser dat niet toestaat. */
  private beep(): void {
    try {
      const ctx = (this.audio ??= new AudioContext());
      for (const offset of [0, 0.4]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        gain.gain.value = 0.3;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.3);
      }
    } catch {
      // geen audio beschikbaar: trilling en melding blijven
    }
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
