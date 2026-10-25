import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { answerSession } from '../testing/auth';
import { RECIPE_FIXTURES, RECIPE_SPARSE, toSummary } from '../testing/fixtures';
import { I18nService } from './i18n.service';
import { RecipeList } from './recipe-list';

describe('RecipeList', () => {
  async function setup(admin = false, favorites: string[] = [], local: string[] | null = null) {
    localStorage.clear();
    if (local) {
      localStorage.setItem('recipes.favorites', JSON.stringify(local));
    }
    await TestBed.configureTestingModule({
      imports: [RecipeList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    TestBed.inject(I18nService).lang.set('nl');
    const fixture = TestBed.createComponent(RecipeList);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    await answerSession(http, admin, favorites);
    return { fixture, http, el: fixture.nativeElement as HTMLElement };
  }

  it('vraagt de lijst in de gekozen taal op en toont de recepten', async () => {
    const { fixture, http, el } = await setup();
    const req = http.expectOne((r) => r.url === '/api/recipes');
    expect(req.request.params.get('lang')).toBe('nl');
    req.flush([toSummary(RECIPE_FIXTURES.nl), toSummary(RECIPE_SPARSE)]);
    await fixture.whenStable();
    const titles = Array.from(el.querySelectorAll('.title')).map((t) => t.textContent);
    expect(titles).toEqual(['Romige curry met kikkererwten', 'Appeltaart']);
    expect(el.querySelector('a.recipe')?.getAttribute('href')).toBe('/recept/curry-kikkererwten');
    const meta = Array.from(el.querySelectorAll('.meta')).map((m) => m.textContent?.replace(/\s+/g, ' ').trim());
    expect(meta).toEqual(['Hoofdgerecht · 45 minuten', 'Zoet']);
  });

  it('toont een lege staat', async () => {
    const { fixture, http, el } = await setup();
    http.expectOne((r) => r.url === '/api/recipes').flush([]);
    await fixture.whenStable();
    expect(el.querySelector('.state')?.textContent).toContain('nog geen recepten');
  });

  it('toont een foutmelding met opnieuw proberen', async () => {
    const { fixture, http, el } = await setup();
    http.expectOne((r) => r.url === '/api/recipes').flush('stuk', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('konden niet worden geladen');
    (el.querySelector('[role=alert] button') as HTMLButtonElement).click();
    fixture.detectChanges();
    http.expectOne((r) => r.url === '/api/recipes').flush([]);
  });

  it('groepeert per soort gerecht met kopjes en filtert', async () => {
    const { fixture, http, el } = await setup();
    http.expectOne((r) => r.url === '/api/recipes').flush([toSummary(RECIPE_SPARSE), toSummary(RECIPE_FIXTURES.nl)]);
    await fixture.whenStable();
    const headings = () => Array.from(el.querySelectorAll('h2')).map((h) => h.textContent?.replace(/\s+/g, ' ').trim());
    expect(headings()).toEqual(['Hoofdgerecht (1)', 'Zoet (1)']);

    const zoet = Array.from(el.querySelectorAll<HTMLButtonElement>('.filter button')).find((b) => b.textContent?.trim() === 'Zoet');
    zoet?.click();
    fixture.detectChanges();
    expect(headings()).toEqual(['Zoet (1)']);
    expect(zoet?.getAttribute('aria-pressed')).toBe('true');
  });

  it('zet favoriete recepten bovenaan met een ster, alleen voor de beheerder', async () => {
    const { fixture, http, el } = await setup(true, ['sparse']);
    http.expectOne((r) => r.url === '/api/recipes').flush([toSummary(RECIPE_FIXTURES.nl), toSummary(RECIPE_SPARSE)]);
    await fixture.whenStable();
    fixture.detectChanges();
    const headings = Array.from(el.querySelectorAll('h2')).map((h) => h.textContent?.replace(/\s+/g, ' ').trim());
    expect(headings).toEqual(['Favorieten (1)', 'Hoofdgerecht (1)', 'Zoet (1)']);
    const first = el.querySelector('.section ul a.recipe');
    expect(first?.querySelector('.title')?.textContent).toContain('Appeltaart');
    expect(first?.querySelector('.star')).not.toBeNull();
    expect(first?.querySelector('.visually-hidden')?.textContent).toContain('Favoriet');
    expect(el.querySelectorAll('.star')).toHaveLength(2);
  });

  it('toont een bezoeker alleen de eigen lokale favorieten, zonder aanroep naar de backend', async () => {
    const { fixture, http, el } = await setup(false, [], ['sparse']);
    http.expectOne((r) => r.url === '/api/recipes').flush([toSummary(RECIPE_FIXTURES.nl), toSummary(RECIPE_SPARSE)]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(Array.from(el.querySelectorAll('h2')).map((h) => h.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'Favorieten (1)',
      'Hoofdgerecht (1)',
      'Zoet (1)',
    ]);
    expect(el.querySelectorAll('.star')).toHaveLength(2);
    http.expectNone('/api/recipes/favorites');
  });

  it('toont zonder favorieten geen favorietenblok en geen sterren', async () => {
    const { fixture, http, el } = await setup(false);
    http.expectOne((r) => r.url === '/api/recipes').flush([toSummary(RECIPE_FIXTURES.nl), toSummary(RECIPE_SPARSE)]);
    await fixture.whenStable();
    expect(Array.from(el.querySelectorAll('h2')).map((h) => h.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['Hoofdgerecht (1)', 'Zoet (1)']);
    expect(el.querySelector('.star')).toBeNull();
  });
});
