import { Lang, Recipe } from './recipe.model';
import { formatQuantity } from './quantity';

export interface ShareLabels {
  intro: string;
  introPlain: string;
  personsLabel: string;
  optional: string;
}

export function buildShareText(recipe: Recipe, servings: number | null, labels: ShareLabels, lang: Lang): string {
  const heading = servings === null ? `${labels.introPlain}: ${recipe.title}` : `${labels.intro} ${servings} ${labels.personsLabel}: ${recipe.title}`;
  const lines = [heading, ''];
  for (const ingredient of recipe.ingredients) {
    const quantity = formatQuantity(ingredient, servings, recipe.servings, lang);
    const optional = ingredient.optional ? ` (${labels.optional})` : '';
    lines.push(`- ${quantity ? quantity + ' ' : ''}${ingredient.name}${optional}`);
  }
  return lines.join('\n');
}
