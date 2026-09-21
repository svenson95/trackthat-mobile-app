import { inject, Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { DEFAULT_LANGUAGE, getSupportedLanguage, SUPPORTED_LANGUAGES } from './language.config';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translateService = inject(TranslateService);

  init(): void {
    this.translateService.addLangs([...SUPPORTED_LANGUAGES]);

    const language =
      getSupportedLanguage(localStorage.getItem('language')) ??
      getSupportedLanguage(this.translateService.getBrowserLang()) ??
      DEFAULT_LANGUAGE;

    document.documentElement.lang = language;
    this.translateService.use(language);
  }
}
