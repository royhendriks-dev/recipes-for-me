import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RECIPE_FIXTURES } from '../testing/fixtures';
import { I18nService } from './i18n.service';
import { RecipeDetail } from './recipe-detail';
import { TimerService } from './timer.service';

describe('RecipeDetail', () => {
  async function setup() {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RecipeDetail],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    TestBed.inject(I18nService).lang.set('nl');
    const fixture = TestBed.createComponent(RecipeDetail);
    fixture.componentRef.setInput('id', 'voorbeeld-curry');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne((r) => r.url === '/api/recipes/voorbeeld-curry').flush(RECIPE_FIXTURES.nl);
    await fixture.whenStable();
    return { fixture, http, el: fixture.nativeElement as HTMLElement };
  }

  it('schaalt hoeveelheden met de personen-slider', async () => {
    const { fixture, el } = await setup();
    expect(el.querySelector('.qty')?.textContent).toBe('240 g');
    const slider = el.querySelector('#servings') as HTMLInputElement;
    slider.value = '2';
    slider.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(el.querySelector('.qty')?.textContent).toBe('120 g');
    expect(el.querySelector('output')?.textContent).toBe('2 personen');
  });

  it('vinkt ingrediënten af en telt ze', async () => {
    const { fixture, el } = await setup();
    (el.querySelector('.ing input') as HTMLInputElement).click();
    await fixture.whenStable();
    expect(el.querySelector('.count')?.textContent).toContain('1 / 13');
    expect(el.querySelector('.ing li')?.classList).toContain('done');
  });

  it('bewaart een favoriet', async () => {
    const { fixture, el } = await setup();
    (el.querySelector('.fav') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelector('.fav')?.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('recipes.favorites')).toContain('voorbeeld-curry');
  });

  it('deelt via Web Share en valt terug op het klembord en daarna op een tekstvak', async () => {
    const { fixture, el } = await setup();
    const shareBtn = el.querySelector('.share .btn') as HTMLButtonElement;

    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    shareBtn.click();
    await fixture.whenStable();
    expect(share).toHaveBeenCalledOnce();

    share.mockRejectedValue(new DOMException('geannuleerd', 'AbortError'));
    shareBtn.click();
    await fixture.whenStable();
    expect(el.querySelector('textarea')).toBeNull();

    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    const writeText = vi.fn().mockRejectedValue(new Error('geweigerd'));
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    shareBtn.click();
    await fixture.whenStable();
    expect(writeText).toHaveBeenCalled();
    expect(el.querySelector('textarea')?.value).toContain('Kikkererwten');
  });

  it('vraagt het recept opnieuw op bij een taalwissel', async () => {
    const { fixture, http } = await setup();
    TestBed.inject(I18nService).lang.set('en');
    fixture.detectChanges();
    const req = http.expectOne((r) => r.url === '/api/recipes/voorbeeld-curry');
    expect(req.request.params.get('lang')).toBe('en');
    req.flush(RECIPE_FIXTURES.en);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('chickpea');
  });

  it('toont een foutmelding als het recept niet geladen kan worden', async () => {
    const { fixture, http, el } = await setup();
    TestBed.inject(I18nService).lang.set('en');
    fixture.detectChanges();
    http.expectOne((r) => r.url === '/api/recipes/voorbeeld-curry').flush('weg', { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('could not be loaded');
  });

  it('start een timer bij een stap die er een heeft', async () => {
    const { fixture, el } = await setup();
    const timers = TestBed.inject(TimerService);
    const button = el.querySelector('.steps .btn') as HTMLButtonElement;
    expect(button.textContent).toContain('12 min');
    button.click();
    await fixture.whenStable();
    expect(timers.timers()).toHaveLength(1);
    expect(timers.timers()[0].totalSec).toBe(720);
    timers.remove(timers.timers()[0].id);
  });
});
