import { SAMPLE_RECIPES } from './sample-recipe';
import { buildShareText } from './share';

describe('buildShareText', () => {
  it('maakt een lijst met geschaalde hoeveelheden en notities', () => {
    const text = buildShareText(SAMPLE_RECIPES.nl, 2, 'Ingrediënten voor', 'personen');
    const lines = text.split('\n');
    expect(lines[0]).toBe('Ingrediënten voor 2 personen: Romige curry met kikkererwten en groenten');
    expect(lines).toContain('- 120 g Kikkererwten (blik, uitgelekt)');
    expect(lines).toContain('- Zout en peper (naar smaak)');
  });
});
