import { Ingredient } from './recipe.model';

const FRACTIONS: Record<number, string> = { 0: '', 0.25: '¼', 0.5: '½', 0.75: '¾' };

/** Rondt af op kwarten en schrijft 1.5 als "1½". */
export function formatFraction(value: number): string {
  const rounded = Math.max(0.25, Math.round(value * 4) / 4);
  const whole = Math.floor(rounded);
  const fraction = FRACTIONS[rounded - whole];
  return whole === 0 ? fraction : `${whole}${fraction}`;
}

/** Schaalt een ingrediënt van `baseServings` naar `servings` personen en geeft de weergavetekst. */
export function formatQuantity(ingredient: Ingredient, servings: number, baseServings: number): string {
  if (ingredient.quantity === null) {
    return '';
  }
  const scaled = (ingredient.quantity * servings) / baseServings;
  if (ingredient.unit === 'g' || ingredient.unit === 'ml') {
    const step = scaled >= 100 ? 10 : 5;
    return `${Math.max(step, Math.round(scaled / step) * step)} ${ingredient.unit}`;
  }
  const rounded = Math.max(0.25, Math.round(scaled * 4) / 4);
  const unit = rounded > 1 && ingredient.unitPlural ? ingredient.unitPlural : ingredient.unit;
  return `${formatFraction(rounded)} ${unit}`.trim();
}
