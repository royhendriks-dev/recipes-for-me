import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';
import { RecipeDetail } from './recipe-detail';

describe('RecipeDetail', () => {
  async function setup() {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [RecipeDetail] }).compileComponents();
    TestBed.inject(I18nService).lang.set('nl');
    const fixture = TestBed.createComponent(RecipeDetail);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
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
});
