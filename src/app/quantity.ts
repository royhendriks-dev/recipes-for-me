import { Ingredient, Lang } from './recipe.model';

const FRACTIONS: Record<number, string> = { 0: '', 0.25: '¼', 0.5: '½', 0.75: '¾' };
const MASS_VOLUME_UNITS = ['g', 'gr', 'gram', 'ml'];

/** Schrijft een hoeveelheid als breuk (1½) als hij bijna op een kwart zit, anders als decimaal getal. */
export function formatAmount(value: number, lang: Lang = 'nl'): string {
  const quarter = Math.round(value * 4) / 4;
  if (quarter > 0 && Math.abs(value - quarter) <= 0.05) {
    const whole = Math.floor(quarter);
    const fraction = FRACTIONS[quarter - whole];
    return whole === 0 ? fraction : `${whole}${fraction}`;
  }
  return Number(value.toFixed(2)).toLocaleString(lang);
}

function roundMassOrVolume(value: number): number {
  if (value >= 100) {
    return Math.round(value / 10) * 10;
  }
  return value >= 10 ? Math.round(value / 5) * 5 : Math.max(1, Math.round(value));
}

/**
 * Schaalt een ingrediënt van `baseServings` naar `servings` personen en geeft de weergavetekst.
 * Zonder hoeveelheid of zonder bekend aantal personen wordt niet geschaald: dan staat er niets
 * of de hoeveelheid zoals de backend die levert.
 */
export function formatQuantity(
  ingredient: Ingredient,
  servings: number | null,
  baseServings: number | null,
  lang: Lang = 'nl',
): string {
  if (ingredient.amount === null) {
    return '';
  }
  const scale = servings !== null && baseServings ? servings / baseServings : 1;
  const scaled = ingredient.amount * scale;
  const unit = ingredient.unit ?? '';
  const amount = MASS_VOLUME_UNITS.includes(unit.toLowerCase()) ? String(roundMassOrVolume(scaled)) : formatAmount(scaled, lang);
  return `${amount} ${unit}`.trim();
}
