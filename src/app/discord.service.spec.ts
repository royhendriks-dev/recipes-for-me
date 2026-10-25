import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DiscordService } from './discord.service';

describe('DiscordService', () => {
  function setup(search = '') {
    window.history.replaceState(null, '', `/${search}#/recept/bami`);
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return { service: TestBed.inject(DiscordService), http: TestBed.inject(HttpTestingController) };
  }

  afterEach(() => window.history.replaceState(null, '', '/'));

  it('leest de status en kijkt opnieuw als het tabblad weer focus krijgt', async () => {
    const { service, http } = setup();
    const first = service.refresh();
    http.expectOne('/api/discord/status').flush({ enabled: true, connected: false });
    await first;
    expect(service.enabled()).toBe(true);
    expect(service.connected()).toBe(false);

    window.dispatchEvent(new Event('focus'));
    http.expectOne('/api/discord/status').flush({ enabled: true, connected: true });
    await new Promise((resolve) => setTimeout(resolve));
    expect(service.connected()).toBe(true);

    document.dispatchEvent(new Event('visibilitychange'));
    http.expectOne('/api/discord/status').flush({ enabled: false, connected: true });
    await new Promise((resolve) => setTimeout(resolve));
    expect(service.connected()).toBe(false); // uit op de server = nooit gekoppeld tonen
  });

  it('zet alles uit als de status niet op te halen is', async () => {
    const { service, http } = setup();
    const done = service.refresh();
    http.expectOne('/api/discord/status').flush(null, { status: 503, statusText: 'Unavailable' });
    await done;
    expect(service.enabled()).toBe(false);
    expect(service.connected()).toBe(false);
  });

  it('vertaalt de antwoorden van het delen', async () => {
    const { service, http } = setup();
    const results: Record<number, string> = { 204: 'sent', 401: 'not_connected', 410: 'disconnected', 429: 'rate_limited', 502: 'error', 503: 'error' };
    for (const [status, expected] of Object.entries(results)) {
      const promise = service.share('bami', 'nl', 2);
      const request = http.expectOne('/api/discord/share');
      expect(request.request.body).toEqual({ recipe: 'bami', lang: 'nl', servings: 2 });
      request.flush(null, { status: Number(status), statusText: 'x' });
      expect(await promise).toBe(expected);
    }
    expect(service.connected()).toBe(false);
  });

  it('ontkoppelt en meldt een mislukte poging', async () => {
    const { service, http } = setup();
    service.connected.set(true);
    const ok = service.disconnect();
    http.expectOne('/api/discord/link').flush(null, { status: 204, statusText: 'No Content' });
    expect(await ok).toBe(true);
    expect(service.connected()).toBe(false);

    const failed = service.disconnect();
    http.expectOne('/api/discord/link').flush(null, { status: 500, statusText: 'x' });
    expect(await failed).toBe(false);
  });

  it('haalt ?discord=... uit het adres en onthoudt de melding', () => {
    const { service } = setup('?discord=connected');
    expect(service.notice()).toBe('connected');
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('#/recept/bami');
    service.dismissNotice();
    expect(service.notice()).toBeNull();
  });

  it('negeert een onbekende melding', () => {
    const { service } = setup('?discord=hacked');
    expect(service.notice()).toBeNull();
    expect(window.location.search).toBe('');
  });
});
