import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { FullscreenService } from './fullscreen.service';
import { I18nService } from './i18n.service';
import { TimerPanel } from './timer-panel';

@Component({
  imports: [RouterOutlet, RouterLink, TimerPanel],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly i18n = inject(I18nService);
  protected readonly fullscreen = inject(FullscreenService);
  private readonly router = inject(Router);
  /** Op de receptpagina staat de kaart onder de terug-link; het timerpaneel schuift mee naar beneden. */
  protected readonly onDetail = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.startsWith('/recept/')),
    ),
    { initialValue: this.router.url.startsWith('/recept/') },
  );
}
