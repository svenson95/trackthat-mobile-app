import { httpResource } from '@angular/common/http';
import { Injectable, linkedSignal } from '@angular/core';

import { environment } from '../../../../environments/environment.prod';
import type { GetUsersResponse, UserDoc } from '../../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = environment.api + 'users';

  readonly currentLanguage = localStorage.getItem('language') || 'de';

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

  allUsersResource = httpResource<GetUsersResponse>(() => {
    return { url: `${this.apiUrl}/`, method: 'GET' };
  });
}
