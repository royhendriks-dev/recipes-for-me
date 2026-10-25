import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { answerSession } from '../testing/auth';
import { RECIPE_FIXTURES, RECIPE_SPARSE } from '../testing/fixtures';
import { I18nService } from './i18n.service';
import { RecipeDetail } from './recipe-detail';
import { TimerService } from './timer.service';

describe('RecipeDetail', () => {
  async function setup(recipe = RECIPE_FIXTURES.nl, admin = true, discord: { enabled: boolean; connected: boolean } = { enabled: false, connected: false }) {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RecipeDetail],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    TestBed.inject(I18nService).lang.set('nl');
    const fixture = TestBed.createComponent(RecipeDetail);
    fixture.componentRef.setInput('id', 'curry-kikkererwten');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    await answerSession(http, admin);
    http.expectOne('/api/discord/status').flush(discord);
    http.expectOne((r) => r.url === '/api/recipes/curry-kikkererwten').flush(recipe);
    await fixture.whenStable();
    fixture.detectChanges();
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
    expect(slider.min).toBe('2');
    expect(slider.step).toBe('2');
  });

  it('zet de personen-slider in het ingrediëntenblok, zodat hij mee inklapt', async () => {
    const { el } = await setup();
    expect(el.querySelector('details.acc #servings')).not.toBeNull();
  });

  it('vinkt ingrediënten af en telt ze', async () => {
    const { fixture, el } = await setup();
    (el.querySelector('.ing input') as HTMLInputElement).click();
    await fixture.whenStable();
    expect(el.querySelector('.count')?.textContent).toContain('1 / 7');
    expect(el.querySelector('.ing li')?.classList).toContain('done');
  });

  it('bewaart een favoriet in de backend, met het CSRF-token', async () => {
    const { fixture, http, el } = await setup();
    (el.querySelector('.fav') as HTMLButtonElement).click();
    const put = http.expectOne('/api/recipes/favorites/curry-kikkererwten');
    expect(put.request.method).toBe('PUT');
    expect(put.request.headers.get('X-CSRF-Token')).toBe('csrf-token-1');
    put.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();
    expect(el.querySelector('.fav')?.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('recipes.favorites')).toBeNull();

    (el.querySelector('.fav') as HTMLButtonElement).click();
    const del = http.expectOne('/api/recipes/favorites/curry-kikkererwten');
    expect(del.request.method).toBe('DELETE');
    del.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();
    expect(el.querySelector('.fav')?.getAttribute('aria-pressed')).toBe('false');
  });

  it('draait een favoriet terug en meldt het als opslaan mislukt', async () => {
    const { fixture, http, el } = await setup();
    (el.querySelector('.fav') as HTMLButtonElement).click();
    http.expectOne('/api/recipes/favorites/curry-kikkererwten').flush({ error: 'forbidden' }, { status: 403, statusText: 'Forbidden' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('.fav')?.getAttribute('aria-pressed')).toBe('false');
    expect(el.querySelector('.toast')?.textContent).toContain('niet gelukt');
  });

  it('toont zonder login geen favorietenknop, maar wel de deelknop', async () => {
    const { el } = await setup(RECIPE_FIXTURES.nl, false);
    expect(el.querySelector('.fav')).toBeNull();
    expect(el.querySelector('.share .btn')).not.toBeNull();
    expect(el.querySelector('.discord')).toBeNull();
    expect(el.querySelector('.ing input')).not.toBeNull();
    expect(el.querySelector('.steps')).not.toBeNull();
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

  it('biedt koppelen aan Discord aan in een nieuw tabblad als Discord aanstaat maar niet gekoppeld is', async () => {
    const { el } = await setup(RECIPE_FIXTURES.nl, false, { enabled: true, connected: false });
    const link = el.querySelector('.discord a.btn') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/api/discord/connect');
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
    expect(el.querySelector('.discord button')).toBeNull();
  });

  it('stuurt het recept naar Discord en meldt de uitkomst', async () => {
    const { fixture, http, el } = await setup(RECIPE_FIXTURES.nl, false, { enabled: true, connected: true });
    const send = el.querySelector('.discord .btn') as HTMLButtonElement;
    expect(send.textContent).toContain('Stuur naar Discord');

    send.click();
    const request = http.expectOne('/api/discord/share');
    expect(request.request.body).toEqual({ recipe: 'curry-kikkererwten', lang: 'nl', servings: expect.any(Number) });
    request.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();
    expect(el.querySelector('.toast')?.textContent).toContain('Naar Discord gestuurd');

    send.click();
    http.expectOne('/api/discord/share').flush({ error: 'rate_limited' }, { status: 429, statusText: 'Too Many Requests' });
    await fixture.whenStable();
    expect(el.querySelector('.toast')?.textContent).toContain('Even wachten');
  });

  it('ontkoppelt Discord', async () => {
    const { fixture, http, el } = await setup(RECIPE_FIXTURES.nl, false, { enabled: true, connected: true });
    (el.querySelector('.discord .btn.alt') as HTMLButtonElement).click();
    http.expectOne('/api/discord/link').flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('.toast')?.textContent).toContain('ontkoppeld');
    expect(el.querySelector('.discord a.btn')).not.toBeNull();
  });

  it('vraagt opnieuw te koppelen als de koppeling weg is', async () => {
    const { fixture, http, el } = await setup(RECIPE_FIXTURES.nl, false, { enabled: true, connected: true });
    (el.querySelector('.discord .btn') as HTMLButtonElement).click();
    http.expectOne('/api/discord/share').flush({ error: 'disconnected' }, { status: 410, statusText: 'Gone' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('.toast')?.textContent).toContain('Koppel Discord opnieuw');
    expect(el.querySelector('.discord a.btn')).not.toBeNull();
  });

  it('vraagt het recept opnieuw op bij een taalwissel', async () => {
    const { fixture, http } = await setup();
    TestBed.inject(I18nService).lang.set('en');
    fixture.detectChanges();
    const req = http.expectOne((r) => r.url === '/api/recipes/curry-kikkererwten');
    expect(req.request.params.get('lang')).toBe('en');
    req.flush(RECIPE_FIXTURES.en);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('chickpea');
  });

  it('toont een aparte melding bij een onbekend recept (404)', async () => {
    const { fixture, http, el } = await setup();
    TestBed.inject(I18nService).lang.set('en');
    fixture.detectChanges();
    http.expectOne((r) => r.url === '/api/recipes/curry-kikkererwten').flush({ error: 'not_found' }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('does not exist');
    expect(el.querySelector('[role=alert] button')).toBeNull();
  });

  it('toont een foutmelding met opnieuw proberen als de backend niet bereikbaar is (503)', async () => {
    const { fixture, http, el } = await setup();
    TestBed.inject(I18nService).lang.set('en');
    fixture.detectChanges();
    http.expectOne((r) => r.url === '/api/recipes/curry-kikkererwten').flush('weg', { status: 503, statusText: 'Service Unavailable' });
    await fixture.whenStable();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('could not be loaded');
    expect(el.querySelector('[role=alert] button')).not.toBeNull();
  });

  it('groepeert ingrediënten en stappen en toont optioneel en notities', async () => {
    const { el } = await setup();
    expect(Array.from(el.querySelectorAll('.group')).map((g) => g.textContent?.trim())).toEqual(['Curry', 'Rijst', 'Curry', 'Rijst', 'Curry']);
    expect(el.querySelector('.note')?.textContent).toContain('optioneel');
    expect(el.querySelector('.notes li')?.textContent).toContain('koriander');
    expect(el.querySelector('.meta')?.textContent).toContain('Hoofdgerecht');
    expect(el.querySelector('.tags li')?.textContent).toBe('vegetarisch');
  });

  it('schaalt niet en toont geen slider of minuten bij een recept zonder aantal personen', async () => {
    const { el } = await setup(RECIPE_SPARSE);
    expect(el.querySelector('#servings')).toBeNull();
    expect(el.querySelector('.meta')?.textContent).not.toContain('minuten');
    expect(Array.from(el.querySelectorAll('.qty')).map((q) => q.textContent)).toEqual(['', '3 stuk']);
    expect(el.querySelector('.ing')?.textContent).toContain('250 g bloem');
    expect(el.textContent).not.toContain('NaN');
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
