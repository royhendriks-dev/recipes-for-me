import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { I18nService } from './i18n.service';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  it('toont het voorbeeldrecept en wisselt van taal', async () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(I18nService).lang.set('nl');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('kikkererwten');

    (el.querySelector('.lang') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelector('h1')?.textContent).toContain('chickpea');
    expect(document.documentElement.lang).toBe('en');
  });
});
