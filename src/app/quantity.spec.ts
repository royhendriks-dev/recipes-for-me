import { formatAmount, formatQuantity } from './quantity';
import { Ingredient } from './recipe.model';

const ing = (amount: number | null, unit: string | null, name = 'x'): Ingredient => ({
  amount,
  unit,
  name,
  group: null,
  optional: false,
});

describe('quantity', () => {
  it('schrijft bijna-kwarten als breuk en de rest als decimaal', () => {
    expect(formatAmount(0.5)).toBe('½');
    expect(formatAmount(1.75)).toBe('1¾');
    expect(formatAmount(2)).toBe('2');
    expect(formatAmount(0.15)).toBe('0,15');
    expect(formatAmount(0.15, 'en')).toBe('0.15');
  });

  it('schaalt gram en milliliter zonder kleine hoeveelheden op te blazen', () => {
    expect(formatQuantity(ing(280, 'g'), 4, 4)).toBe('280 g');
    expect(formatQuantity(ing(280, 'g'), 1, 4)).toBe('70 g');
    expect(formatQuantity(ing(20, 'g'), 1, 4)).toBe('5 g');
    expect(formatQuantity(ing(6, 'ml'), 1, 4)).toBe('2 ml');
    expect(formatQuantity(ing(2, 'g'), 1, 4)).toBe('1 g');
  });

  it('schaalt andere eenheden en houdt de eenheid zoals de backend die geeft', () => {
    expect(formatQuantity(ing(2, 'stuk'), 2, 4)).toBe('1 stuk');
    expect(formatQuantity(ing(0.5, 'stuk'), 4, 4)).toBe('½ stuk');
    expect(formatQuantity(ing(0.3, 'kg'), 2, 4)).toBe('0,15 kg');
    expect(formatQuantity(ing(3, null), 4, 4)).toBe('3');
  });

  it('geeft niets terug zonder hoeveelheid', () => {
    expect(formatQuantity(ing(null, null), 3, 4)).toBe('');
  });

  it('schaalt niet als het aantal personen onbekend is, en geeft nooit NaN', () => {
    expect(formatQuantity(ing(250, 'g'), null, null)).toBe('250 g');
    expect(formatQuantity(ing(250, 'g'), 2, null)).toBe('250 g');
    expect(formatQuantity(ing(250, 'g'), null, 4)).toBe('250 g');
    expect(formatQuantity(ing(250, 'g'), 2, 0)).toBe('250 g');
  });
});
