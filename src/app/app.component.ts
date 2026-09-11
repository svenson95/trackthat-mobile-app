import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  bicycle,
  bicycleOutline,
  calendar,
  calendarOutline,
  ellipsisHorizontal,
  ellipsisVertical,
  listOutline,
  person,
  personOutline,
} from 'ionicons/icons';

import { TranslateService } from '@ngx-translate/core';

import { ServerStartupOverlayComponent } from './shared/components';
import { AppService, StartupService } from './shared/services';

export const registerAppIcons = (): void => {
  addIcons({
    add,
    bicycle,
    bicycleOutline,
    calendar,
    calendarOutline,
    ellipsisHorizontal,
    ellipsisVertical,
    listOutline,
    person,
    personOutline,
  });
};

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonApp, IonRouterOutlet, ServerStartupOverlayComponent],
  providers: [AppService],
  styles: `
    :host {
      position: static;
    }
  `,
  template: `
    <ion-app>
      <ion-router-outlet (activate)="onRouteActivated()"></ion-router-outlet>

      <app-server-startup-overlay />
    </ion-app>
  `,
})
export class AppComponent {
  private readonly SUPPORTED_LANGUAGES = ['de', 'en'] as const;
  private readonly DEFAULT_LANGAUGE = 'de';

  private readonly startupService = inject(StartupService);
  private readonly appService = inject(AppService);
  private readonly translate = inject(TranslateService);

  constructor() {
    registerAppIcons();

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
