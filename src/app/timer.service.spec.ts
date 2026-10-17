import { TestBed } from '@angular/core/testing';
import { TimerService } from './timer.service';

describe('TimerService', () => {
  let service: TimerService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerService);
  });

  afterEach(() => {
    service.timers().forEach((t) => service.remove(t.id));
    vi.useRealTimers();
  });

  it('telt af op eindtijd en meldt wanneer hij klaar is', () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true });
    service.start('Rijst', 10);
    const timer = service.timers()[0];
    expect(service.leftSec(timer)).toBe(10);

    vi.advanceTimersByTime(4000);
    expect(service.leftSec(service.timers()[0])).toBe(6);
    expect(service.finished()).toBe('');

    vi.advanceTimersByTime(6000);
    const done = service.timers()[0];
    expect(service.isDone(done)).toBe(true);
    expect(service.leftSec(done)).toBe(0);
    expect(service.finished()).toBe('Rijst');
    expect(vibrate).toHaveBeenCalled();
  });

  it('pauzeert en hervat zonder tijd te verliezen', () => {
    service.start('Curry', 60);
    vi.advanceTimersByTime(20_000);
    service.toggle(service.timers()[0].id);
    vi.advanceTimersByTime(30_000);
    const paused = service.timers()[0];
    expect(service.isRunning(paused)).toBe(false);
    expect(service.leftSec(paused)).toBe(40);

    service.toggle(paused.id);
    vi.advanceTimersByTime(10_000);
    expect(service.leftSec(service.timers()[0])).toBe(30);
  });

  it('telt er een minuut bij op, lopend en gepauzeerd', () => {
    service.start('Groenten', 30);
    const id = service.timers()[0].id;
    service.addMinutes(id, 1);
    expect(service.leftSec(service.timers()[0])).toBe(90);
    expect(service.timers()[0].totalSec).toBe(90);

    service.toggle(id);
    service.addMinutes(id, 1);
    expect(service.leftSec(service.timers()[0])).toBe(150);
  });

  it('verwijdert een timer en laat een afgelopen timer met rust', () => {
    service.start('Kort', 1);
    vi.advanceTimersByTime(1000);
    const id = service.timers()[0].id;
    service.addMinutes(id, 1);
    expect(service.leftSec(service.timers()[0])).toBe(0);
    service.remove(id);
    expect(service.timers()).toEqual([]);
  });

  it('reset naar de ingestelde duur en past de duur aan', () => {
    const id = service.add('Ei', 120);
    service.toggle(id);
    vi.advanceTimersByTime(30_000);
    service.reset(id);
    expect(service.leftSec(service.timers()[0])).toBe(120);
    expect(service.isRunning(service.timers()[0])).toBe(false);

    service.setDuration(id, 0);
    expect(service.timers()[0].initialSec).toBe(120);
    service.setDuration(id, 45);
    service.addMinutes(id, 1);
    service.reset(id);
    expect(service.leftSec(service.timers()[0])).toBe(45);
  });

  it('piept bij afloop', () => {
    const start = vi.fn();
    class FakeAudio {
      currentTime = 0;
      destination = {};
      createOscillator = () => ({ frequency: {}, connect: vi.fn(), start, stop: vi.fn() });
      createGain = () => ({ gain: {}, connect: vi.fn() });
    }
    vi.stubGlobal('AudioContext', FakeAudio);
    service.start('Kort', 1);
    vi.advanceTimersByTime(1000);
    expect(start).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
  });

  it('vraagt een scherm-aan-slot aan zolang een timer loopt', async () => {
    const release = vi.fn().mockResolvedValue(undefined);
    const sentinel = { release, addEventListener: vi.fn() };
    const request = vi.fn().mockResolvedValue(sentinel);
    Object.defineProperty(navigator, 'wakeLock', { value: { request }, configurable: true });
    service.start('Rijst', 5);
    await vi.advanceTimersByTimeAsync(0);
    expect(request).toHaveBeenCalledWith('screen');
    service.remove(service.timers()[0].id);
    await vi.advanceTimersByTimeAsync(0);
    expect(release).toHaveBeenCalled();
    Object.defineProperty(navigator, 'wakeLock', { value: undefined, configurable: true });
  });
});
