import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RECIPE_FIXTURES } from '../testing/fixtures';
import { App } from './app';
import { I18nService } from './i18n.service';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)],
    }).compileComponents();
  });

  it('toont de lijst en wisselt van taal', async () => {
    const i18n = TestBed.inject(I18nService);
    i18n.lang.set('nl');
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne((r) => r.url === '/api/recipes').flush([]);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toBe('Alle recepten');

    (el.querySelector('.lang') as HTMLButtonElement).click();
    fixture.detectChanges();
    http.expectOne((r) => r.url === '/api/recipes').flush([]);
    await fixture.whenStable();
    expect(el.querySelector('h1')?.textContent).toBe('All recipes');
    expect(document.documentElement.lang).toBe('en');
    expect(RECIPE_FIXTURES.en.id).toBe(RECIPE_FIXTURES.nl.id);
  });
});
