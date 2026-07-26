import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { TranslateService } from '@ngx-translate/core';

import { AppService, HealthService, StartupService } from './shared/services';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule],
  providers: [AppService],
  styles: `
    :host {
      position: static;
    }
  `,
  template: `
    <ion-app>
      <ion-router-outlet (activate)="onRouteActivated()"></ion-router-outlet>
    </ion-app>
  `,
})
export class AppComponent {
  private readonly SUPPORTED_LANGUAGES = ['de', 'en'] as const;
  private readonly DEFAULT_LANGAUGE = 'de';
  private readonly startupService = inject(StartupService);

  private appService = inject(AppService);
  private translate = inject(TranslateService);

  private readonly healthService = inject(HealthService);

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      this.healthService.pingToRefresh();
    }
  }

  @HostListener('window:pageshow', ['$event'])
  onPageShow(event: PageTransitionEvent): void {
    if (event.persisted) {
      this.healthService.pingToRefresh();
    }
  }

  constructor() {
    this.healthService.pingToRefresh();
    this.appService.getVersionUpdates();
    this.appService.updateUserData();
    this.appService.preventBrowserSwipeBack();

    this.configureTranslate();
  }

  onRouteActivated(): void {
    if (this.startupService.routeActivated) {
      return;
    }

    this.startupService.routeActivated = true;
    this.startupService.hideAppInitializer();
  }

  private configureTranslate(): void {
    this.translate.addLangs([...this.SUPPORTED_LANGUAGES]);
    this.translate.setDefaultLang(this.DEFAULT_LANGAUGE);

    this.translate.use(
      this.getSupportedLang(localStorage.getItem('language')) ??
        this.getSupportedLang(this.translate.getBrowserLang()) ??
        this.DEFAULT_LANGAUGE,
    );
  }

  private getSupportedLang(lang: string | null | undefined): 'de' | 'en' | undefined {
    return this.SUPPORTED_LANGUAGES.includes(lang as 'de' | 'en')
      ? (lang as 'de' | 'en')
      : undefined;
  }
}
