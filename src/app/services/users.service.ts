import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment.prod';

import type { User } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.api + 'users';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  usersResource = httpResource<Array<User>>(
    () => {
      const userId = this.authService.user()?.userId;
      if (!userId) return undefined;
      return { url: `${this.apiUrl}/id`, method: 'GET' };
    },
    {
      defaultValue: {} as Array<User>,
    },
  );

  getUsers(): Observable<Array<User>> {
    return this.http.get<Array<User>>(this.apiUrl + '/');
  }

  addUser(user: User): Observable<unknown> {
    return this.http.post<unknown>(this.apiUrl + '/add', user);
  }
}
