import { TestBed } from '@angular/core/testing';
import { FullscreenService } from './fullscreen.service';

describe('FullscreenService', () => {
  let current: Element | null;

  beforeEach(() => {
    current = null;
    Object.defineProperty(document, 'fullscreenEnabled', { value: true, configurable: true });
    Object.defineProperty(document, 'fullscreenElement', { get: () => current, configurable: true });
    document.documentElement.requestFullscreen = vi.fn(async () => {
      current = document.documentElement;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    document.exitFullscreen = vi.fn(async () => {
      current = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
  });

  it('schakelt volledig scherm in en uit en volgt de status', async () => {
    const service = TestBed.inject(FullscreenService);
    expect(service.supported).toBe(true);
    expect(service.active()).toBe(false);
    await service.toggle();
    expect(service.active()).toBe(true);
    await service.toggle();
    expect(service.active()).toBe(false);
  });

  it('negeert een geweigerd verzoek', async () => {
    document.documentElement.requestFullscreen = vi.fn(async () => {
      throw new Error('geweigerd');
    });
    const service = TestBed.inject(FullscreenService);
    await service.toggle();
    expect(service.active()).toBe(false);
  });
});
