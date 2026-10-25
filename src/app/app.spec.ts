import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RECIPE_FIXTURES } from '../testing/fixtures';
import { App } from './app';
import { FullscreenService } from './fullscreen.service';
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

    // los draaiend (niet in het portfolio-iframe) is er een eigen taalknop
    (el.querySelector('.lang') as HTMLButtonElement).click();
    fixture.detectChanges();
    http.expectOne((r) => r.url === '/api/recipes').flush([]);
    await fixture.whenStable();
    expect(el.querySelector('h1')?.textContent).toBe('All recipes');
    expect(document.documentElement.lang).toBe('en');
    expect(RECIPE_FIXTURES.en.id).toBe(RECIPE_FIXTURES.nl.id);
  });

  it('volgt de taal die het portfolio in localStorage zet', () => {
    const i18n = TestBed.inject(I18nService);
    i18n.lang.set('nl');
    window.dispatchEvent(new StorageEvent('storage', { key: 'lang', newValue: 'en' }));
    expect(i18n.lang()).toBe('en');
    window.dispatchEvent(new StorageEvent('storage', { key: 'lang', newValue: 'xx' }));
    expect(i18n.lang()).toBe('en');
  });

  it('toont geen eigen taalknop binnen het portfolio', async () => {
    const i18n = TestBed.inject(I18nService);
    (i18n as { embedded: boolean }).embedded = true;
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.lang')).toBeNull();
  });

  it('schuift het timerpaneel onder de terug-link op de receptpagina', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne((r) => r.url === '/api/recipes').flush([]);
    await fixture.whenStable();
    const side = (fixture.nativeElement as HTMLElement).querySelector('.side') as HTMLElement;
    expect(side.classList.contains('below-back')).toBe(false);

    await router.navigateByUrl('/recept/curry-kikkererwten');
    fixture.detectChanges();
    http.match(() => true);
    expect(side.classList.contains('below-back')).toBe(true);
  });

  it('toont de volledig-scherm-knop alleen als de browser dat toestaat', () => {
    const fullscreen = TestBed.inject(FullscreenService) as { supported: boolean };
    fullscreen.supported = false;
    let fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.icon-btn')).toBeNull();

    fullscreen.supported = true;
    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('.icon-btn') as HTMLButtonElement;
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBeTruthy();
  });
  it('toont na terugkomst van Discord een melding die je kunt sluiten', async () => {
    window.history.replaceState(null, '', '/?discord=limit');
    TestBed.inject(I18nService).lang.set('nl');
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne((r) => r.url === '/api/recipes').flush([]);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.notice')?.getAttribute('role')).toBe('status');
    expect(el.querySelector('.notice p')?.textContent).toContain('maximale aantal koppelingen');
    (el.querySelector('.notice button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('.notice')).toBeNull();
    window.history.replaceState(null, '', '/');
  });
});
