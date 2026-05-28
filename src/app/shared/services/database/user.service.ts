import { inject, Injectable, linkedSignal, signal } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import type { UserDoc } from '../../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly translate = inject(TranslateService);

  readonly currentLanguage = signal<string>(localStorage.getItem('language') || 'de');

  readonly userData = linkedSignal<undefined | UserDoc>(
    () => {
      const token = localStorage.getItem('user');
      if (token) return JSON.parse(token);
      return undefined;
    },
    {
      equal: (a, b) => a?.id === b?.id,
    },
  );

  setUser(user: UserDoc | undefined): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userData.set(user);
  }

  clearUser(): void {
    localStorage.removeItem('user');
    this.userData.set(undefined);
  }

  setLanguage(lang: 'de' | 'en'): void {
    localStorage.setItem('language', lang);
    this.translate.use(lang);
    this.currentLanguage.set(lang);
  }
}
