import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment.prod';

import type { User } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.api + 'users';
  private http = inject(HttpClient);

  getUsers(): Observable<Array<User>> {
    return this.http.get<Array<User>>(this.apiUrl + '/');
  }

  addUser(user: User): Observable<unknown> {
    return this.http.post<unknown>(this.apiUrl + '/add', user);
  }
}
