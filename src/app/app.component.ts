import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { TranslateService } from '@ngx-translate/core';

import { AppService } from './services';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule],
  providers: [AppService],
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
})
export class AppComponent {
  private appService = inject(AppService);
  private translate = inject(TranslateService);

  constructor() {
    this.appService.getVersionUpdates();
    this.appService.updateUserData();
    this.appService.preventBrowserSwipeBack();

    this.configureTranslate();
  }

  private configureTranslate(): void {
    this.translate.addLangs(['de', 'en']);
    const lang = localStorage.getItem('language') || this.translate.getBrowserLang() || 'de';
    this.translate.use(lang);
  }
}
