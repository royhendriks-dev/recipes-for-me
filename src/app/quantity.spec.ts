import { formatFraction, formatQuantity } from './quantity';

describe('quantity', () => {
  it('schrijft kwarten als breuken', () => {
    expect(formatFraction(0.5)).toBe('½');
    expect(formatFraction(1.75)).toBe('1¾');
    expect(formatFraction(2)).toBe('2');
    expect(formatFraction(0.1)).toBe('¼');
  });

  it('schaalt gram en milliliter in stappen van 5 of 10', () => {
    const rijst = { name: 'Rijst', quantity: 280, unit: 'g' };
    expect(formatQuantity(rijst, 4, 4)).toBe('280 g');
    expect(formatQuantity(rijst, 1, 4)).toBe('70 g');
    expect(formatQuantity({ name: 'Gember', quantity: 20, unit: 'g' }, 1, 4)).toBe('5 g');
  });

  it('kiest enkelvoud of meervoud en rondt af op kwarten', () => {
    const paprika = { name: 'Paprika', quantity: 2, unit: 'stuk', unitPlural: 'stuks' };
    expect(formatQuantity(paprika, 4, 4)).toBe('2 stuks');
    expect(formatQuantity(paprika, 2, 4)).toBe('1 stuk');
    expect(formatQuantity({ name: 'Limoen', quantity: 0.5, unit: 'stuk', unitPlural: 'stuks' }, 4, 4)).toBe('½ stuk');
  });

  it('geeft niets terug voor "naar smaak"', () => {
    expect(formatQuantity({ name: 'Zout', quantity: null, unit: '' }, 3, 4)).toBe('');
  });
});
