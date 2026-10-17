import { RECIPE_FIXTURES, RECIPE_SPARSE } from '../testing/fixtures';
import { buildShareText } from './share';

const labels = { intro: 'Ingrediënten voor', introPlain: 'Ingrediënten', personsLabel: 'personen', optional: 'optioneel' };

describe('buildShareText', () => {
  it('maakt een lijst met geschaalde hoeveelheden en optionele regels', () => {
    const lines = buildShareText(RECIPE_FIXTURES.nl, 2, labels, 'nl').split('\n');
    expect(lines[0]).toBe('Ingrediënten voor 2 personen: Romige curry met kikkererwten');
    expect(lines).toContain('- 120 g Kikkererwten (blik, uitgelekt)');
    expect(lines).toContain('- 140 g Basmatirijst');
    expect(lines).toContain('- 8 g Verse koriander (optioneel)');
    expect(lines).toContain('- Zout en peper');
  });

  it('laat het aantal personen weg en schaalt niet bij een recept zonder aantal personen', () => {
    const lines = buildShareText(RECIPE_SPARSE, null, labels, 'nl').split('\n');
    expect(lines[0]).toBe('Ingrediënten: Appeltaart');
    expect(lines).toContain('- 250 g bloem');
    expect(lines).toContain('- 3 stuk appels');
  });
});
