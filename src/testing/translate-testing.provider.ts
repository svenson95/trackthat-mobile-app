import type { Provider } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';

export const provideTestTranslations = (): Provider[] =>
  provideTranslateService({
    fallbackLang: 'de',
  });
