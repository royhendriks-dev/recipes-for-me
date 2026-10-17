import { Routes } from '@angular/router';
import { RecipeDetail } from './recipe-detail';
import { RecipeList } from './recipe-list';

export const routes: Routes = [
  { path: '', component: RecipeList },
  { path: 'recept/:id', component: RecipeDetail },
  { path: '**', redirectTo: '' },
];
