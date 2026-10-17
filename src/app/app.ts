import { Component, inject } from '@angular/core';
import { I18nService } from './i18n.service';
import { RecipeDetail } from './recipe-detail';

@Component({
  imports: [RecipeDetail],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly i18n = inject(I18nService);
}
