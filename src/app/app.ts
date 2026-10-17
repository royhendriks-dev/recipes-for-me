import { Component, inject } from '@angular/core';
import { I18nService } from './i18n.service';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TimerPanel } from './timer-panel';

@Component({
  imports: [RouterOutlet, RouterLink, TimerPanel],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly i18n = inject(I18nService);
}
