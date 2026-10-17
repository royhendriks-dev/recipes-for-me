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
    expect(timers.timers()[0]).toMatchObject({ name: 'Eigen timer', totalSec: 300 });
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

  it('telt tijd erbij en stelt presets en eigen tijd in', async () => {
    const { fixture, timers, el } = await setup();
    timers.add('Rijst', 300);
    await fixture.whenStable();

    await click(fixture, byText(el, '+5m'));
    expect(el.querySelector('.time')?.textContent).toBe('10:00');

    await click(fixture, byText(el, '3m'));
    expect(el.querySelector('.time')?.textContent).toBe('03:00');

    const [min, sec] = Array.from(el.querySelectorAll('.custom input')) as HTMLInputElement[];
    min.value = '2';
    sec.value = '30';
    await click(fixture, byText(el, 'Instellen'));
    expect(el.querySelector('.time')?.textContent).toBe('02:30');
  });

  it('hernoemt en verwijdert een timer', async () => {
    const { fixture, timers, el } = await setup();
    timers.add('Rijst', 300);
    await fixture.whenStable();

    const name = el.querySelector('.field input') as HTMLInputElement;
    name.value = 'Eieren';
    name.dispatchEvent(new Event('input'));
    expect(timers.timers()[0].name).toBe('Eieren');

    await click(fixture, el.querySelector('.remove'));
    expect(timers.timers()).toHaveLength(0);
  });
});
