import { Recipe } from './recipe.model';
import { formatQuantity } from './quantity';

export function buildShareText(recipe: Recipe, servings: number, intro: string, personsLabel: string): string {
  const lines = [`${intro} ${servings} ${personsLabel}: ${recipe.title}`, ''];
  for (const ingredient of recipe.ingredients) {
    const quantity = formatQuantity(ingredient, servings, recipe.servings);
    const note = ingredient.note ? ` (${ingredient.note})` : '';
    lines.push(`- ${quantity ? quantity + ' ' : ''}${ingredient.name}${note}`);
  }
  return lines.join('\n');
}
