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

  it('toont een lege staat en start een eigen timer via het formulier', async () => {
    const { fixture, timers, el } = await setup();
    expect(el.querySelector('.empty')).not.toBeNull();

    (el.querySelector('.head button') as HTMLButtonElement).click();
    await fixture.whenStable();
    (el.querySelector('.chip') as HTMLButtonElement).click();
    el.querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(timers.timers()).toHaveLength(1);
    expect(timers.timers()[0].name).toBe('Eigen timer');
    expect(timers.timers()[0].totalSec).toBe(300);
    expect(el.querySelector('.time')?.textContent).toBe('05:00');
  });

  it('negeert een timer van nul seconden', async () => {
    const { fixture, timers, el } = await setup();
    (el.querySelector('.head button') as HTMLButtonElement).click();
    await fixture.whenStable();
    (el.querySelector('input[type=number]') as HTMLInputElement).value = '0';
    el.querySelector('form')?.dispatchEvent(new Event('submit'));
    expect(timers.timers()).toHaveLength(0);
  });

  it('bedient een lopende timer: pauzeren, +1 min en verwijderen', async () => {
    const { fixture, timers, el } = await setup();
    timers.start('Rijst', 600);
    await fixture.whenStable();
    const buttons = () => Array.from(el.querySelectorAll('.timer .row button')) as HTMLButtonElement[];
    expect(buttons().map((b) => b.textContent?.trim())).toEqual(['Pauzeren', '+1 min', 'Verwijderen']);

    buttons()[0].click();
    await fixture.whenStable();
    expect(buttons()[0].textContent?.trim()).toBe('Hervatten');

    buttons()[1].click();
    await fixture.whenStable();
    expect(el.querySelector('.time')?.textContent).toBe('11:00');

    buttons()[2].click();
    await fixture.whenStable();
    expect(timers.timers()).toHaveLength(0);
  });
});
