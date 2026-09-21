import { inject, Injectable, linkedSignal, signal } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { DEFAULT_LANGUAGE, getSupportedLanguage, type SupportedLanguage } from '../language';

import type { UserDoc } from './types/users.types';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly translate = inject(TranslateService);

  readonly currentLanguage = signal<SupportedLanguage>(
    getSupportedLanguage(localStorage.getItem('language')) ?? DEFAULT_LANGUAGE,
  );

  readonly userData = linkedSignal<undefined | UserDoc>(
    () => {
      const token = localStorage.getItem('user');

      if (token) {
        return JSON.parse(token);
      }

      return undefined;
    },
    {
      equal: (a, b) => a?.id === b?.id,
    },
  );

  setUser(user: UserDoc): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userData.set(user);
  }

  clearUser(): void {
    localStorage.removeItem('user');
    this.userData.set(undefined);
  }

  setLanguage(language: SupportedLanguage): void {
    localStorage.setItem('language', language);
    this.translate.use(language);
    this.currentLanguage.set(language);
  }
}
