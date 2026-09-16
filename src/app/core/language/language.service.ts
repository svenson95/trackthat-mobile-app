import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const SUPPORTED_LANGUAGES = ['de', 'en'] as const;
const DEFAULT_LANGUAGE = 'de';

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translateService = inject(TranslateService);

  initialize(): void {
    this.translateService.addLangs([...SUPPORTED_LANGUAGES]);

    const language =
      this.getSupportedLanguage(localStorage.getItem('language')) ??
      this.getSupportedLanguage(this.translateService.getBrowserLang()) ??
      DEFAULT_LANGUAGE;

    this.translateService.use(language);
  }

  private getSupportedLanguage(language: string | null | undefined): SupportedLanguage | undefined {
    return SUPPORTED_LANGUAGES.find((supportedLanguage) => supportedLanguage === language);
  }
}
