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
  private readonly SUPPORTED_LANGUAGES = ['de', 'en'] as const;
  private readonly DEFAULT_LANGAUGE = 'de';

  private appService = inject(AppService);
  private translate = inject(TranslateService);

  constructor() {
    this.appService.getVersionUpdates();
    this.appService.updateUserData();
    this.appService.preventBrowserSwipeBack();

    this.configureTranslate();
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
