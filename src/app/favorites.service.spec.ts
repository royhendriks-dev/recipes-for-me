import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { answerSession } from '../testing/auth';
import { AuthService } from './auth.service';
import { FavoritesService } from './favorites.service';

describe('AuthService en FavoritesService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  });

  it('is geen beheerder zonder sessie en laat geen favorieten zien', async () => {
    const auth = TestBed.inject(AuthService);
    const favorites = TestBed.inject(FavoritesService);
    await answerSession(TestBed.inject(HttpTestingController), false);
    expect(auth.admin()).toBe(false);
    expect(auth.csrfToken()).toBe('');
    expect(favorites.ids()).toEqual([]);
  });

  it('is geen beheerder als de sessie-aanroep mislukt', async () => {
    const auth = TestBed.inject(AuthService);
    TestBed.inject(HttpTestingController).expectOne('/api/auth/session').flush('stuk', { status: 503, statusText: 'Service Unavailable' });
    await new Promise((resolve) => setTimeout(resolve));
    expect(auth.admin()).toBe(false);
  });

  it('is geen beheerder zonder de rol admin', async () => {
    const auth = TestBed.inject(AuthService);
    TestBed.inject(HttpTestingController).expectOne('/api/auth/session').flush({ username: 'x', roles: [], csrfToken: 'c' });
    await new Promise((resolve) => setTimeout(resolve));
    expect(auth.admin()).toBe(false);
  });

  it('laadt favorieten van de beheerder en leegt ze als het laden mislukt', async () => {
    TestBed.inject(AuthService);
    const favorites = TestBed.inject(FavoritesService);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/auth/session').flush({ username: 'roy', roles: ['admin'], csrfToken: 'c' });
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
    http.expectOne('/api/recipes/favorites').flush('stuk', { status: 500, statusText: 'Server Error' });
    await new Promise((resolve) => setTimeout(resolve));
    expect(favorites.ids()).toEqual([]);
  });

  it('leest lokale favorieten van een bezoeker en negeert vervuilde opslag', async () => {
    localStorage.setItem('recipes.favorites', JSON.stringify(['a', 3, 'b']));
    const favorites = TestBed.inject(FavoritesService);
    await answerSession(TestBed.inject(HttpTestingController), false);
    expect(favorites.ids()).toEqual(['a', 'b']);
    localStorage.setItem('recipes.favorites', '{kapot');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    expect(TestBed.inject(FavoritesService).ids()).toEqual([]);
    localStorage.setItem('recipes.favorites', '"geen lijst"');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    expect(TestBed.inject(FavoritesService).ids()).toEqual([]);
  });
});
