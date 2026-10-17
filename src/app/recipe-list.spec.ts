import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RECIPE_FIXTURES, RECIPE_SPARSE, toSummary } from '../testing/fixtures';
import { I18nService } from './i18n.service';
import { RecipeList } from './recipe-list';

describe('RecipeList', () => {
  async function setup() {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RecipeList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    TestBed.inject(I18nService).lang.set('nl');
    const fixture = TestBed.createComponent(RecipeList);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
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
});
