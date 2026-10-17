import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';
import { TimerPanel } from './timer-panel';
import { TimerService } from './timer.service';

describe('TimerPanel', () => {
  async function setup() {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [TimerPanel] }).compileComponents();
    TestBed.inject(I18nService).lang.set('nl');
    const fixture = TestBed.createComponent(TimerPanel);
    await fixture.whenStable();
    const timers = TestBed.inject(TimerService);
    return { fixture, timers, el: fixture.nativeElement as HTMLElement };
  }

  afterEach(() => {
    const timers = TestBed.inject(TimerService);
    timers.timers().forEach((t) => timers.remove(t.id));
  });

  const click = async (fixture: { whenStable(): Promise<unknown> }, el: Element | null) => {
    (el as HTMLElement).click();
    await fixture.whenStable();
  };
  const byText = (el: HTMLElement, text: string) =>
    Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.replace(/\s+/g, ' ').includes(text)) ?? null;

  it('toont een lege staat en voegt een timer toe die nog niet loopt', async () => {
    const { fixture, timers, el } = await setup();
    expect(el.querySelector('.empty')).not.toBeNull();

    await click(fixture, el.querySelector('.add'));
    expect(timers.timers()).toHaveLength(1);
    expect(timers.timers()[0]).toMatchObject({ name: 'Keukentimer', totalSec: 300 });
    expect(timers.isRunning(timers.timers()[0])).toBe(false);
    expect(el.querySelector('.time')?.textContent).toBe('05:00');
    expect(el.querySelector('.status')?.textContent).toBe('Klaar om te starten');
  });

  it('start, pauzeert en reset een timer', async () => {
    const { fixture, timers, el } = await setup();
    timers.add('Pasta', 600);
    await fixture.whenStable();

    await click(fixture, el.querySelector('.go'));
    expect(el.querySelector('.status')?.textContent).toBe('Loopt');
    await click(fixture, el.querySelector('.go'));
    expect(el.querySelector('.status')?.textContent).toBe('Gepauzeerd');

    await click(fixture, el.querySelector('.reset'));
    expect(el.querySelector('.status')?.textContent).toBe('Klaar om te starten');
    expect(el.querySelector('.time')?.textContent).toBe('10:00');
  });

  it('telt tijd erbij', async () => {
    const { fixture, timers, el } = await setup();
    timers.add('Rijst', 300);
    await fixture.whenStable();

    await click(fixture, byText(el, '+5m'));
    expect(el.querySelector('.time')?.textContent).toBe('10:00');
  });

  it('pakt een ingevulde tijd meteen bij Starten en leegt de velden', async () => {
    const { fixture, timers, el } = await setup();
    timers.add('Rijst', 300);
    await fixture.whenStable();
    const [min, sec] = Array.from(el.querySelectorAll('.custom input')) as HTMLInputElement[];
    expect(min.value).toBe('');
    expect(sec.value).toBe('');

    min.value = '2';
    sec.value = '30';
    await click(fixture, el.querySelector('.go'));
    expect(timers.isRunning(timers.timers()[0])).toBe(true);
    expect(timers.timers()[0].totalSec).toBe(150);
    expect(min.value).toBe('');
    expect(sec.value).toBe('');

    min.value = '9';
    await click(fixture, el.querySelector('.go'));
    expect(timers.isRunning(timers.timers()[0])).toBe(false);
    expect(timers.timers()[0].totalSec).toBe(150);
  });

  it('start een afgelopen timer opnieuw', async () => {
    const { fixture, timers, el } = await setup();
    const id = timers.add('Ei', 1);
    timers.toggle(id);
    timers.timers.update((all) => all.map((t) => ({ ...t, endsAt: null, pausedLeftSec: 0 })));
    await fixture.whenStable();
    expect(el.querySelector('.status')?.textContent).toBe('Tijd is om!');

    await click(fixture, el.querySelector('.go'));
    expect(timers.isRunning(timers.timers()[0])).toBe(true);
  });

  it('toont de naam als kopje, laat hem wijzigen en verwijdert een timer', async () => {
    const { fixture, timers, el } = await setup();
    timers.add('Rijst', 300);
    await fixture.whenStable();
    expect(el.querySelector('.timer h3')?.textContent).toBe('Rijst');

    await click(fixture, el.querySelector('.top .icon'));
    const input = el.querySelector('.rename input') as HTMLInputElement;
    input.value = 'Eieren';
    el.querySelector('.rename')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(timers.timers()[0].name).toBe('Eieren');
    expect(el.querySelector('.timer h3')?.textContent).toBe('Eieren');

    await click(fixture, el.querySelector('.top .icon'));
    (el.querySelector('.rename input') as HTMLInputElement).value = '  ';
    el.querySelector('.rename')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(timers.timers()[0].name).toBe('Keukentimer');

    await click(fixture, el.querySelector('.remove'));
    expect(timers.timers()).toHaveLength(0);
  });
});
