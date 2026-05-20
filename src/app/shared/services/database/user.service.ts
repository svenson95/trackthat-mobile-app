import { httpResource } from '@angular/common/http';
import { computed, Injectable, linkedSignal } from '@angular/core';

import { environment } from '../../../../environments/environment.prod';
import type { GetUsersResponse, UserDoc } from '../../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.api + 'users';

  currentLanguage = localStorage.getItem('language') || 'de';

  userData = linkedSignal<undefined | UserDoc>(() => {
    const token = localStorage.getItem('user');
    if (token) return JSON.parse(token);
    return undefined;
  });

  setUser(user: UserDoc | undefined): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userData.set(user);
  }

  clearUser(): void {
    localStorage.removeItem('user');
    this.userData.set(undefined);
  }

  user = computed<UserDoc>(() => {
    const user = this.userData();
    if (!user) throw new Error('Unexpected user undefined');
    return user;
  });

  allUsersResource = httpResource<GetUsersResponse>(() => {
    return { url: `${this.apiUrl}/`, method: 'GET' };
  });
}
