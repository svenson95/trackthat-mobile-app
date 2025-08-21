import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'https://track-e-backend.fly.dev/api/users';
  private http = inject(HttpClient);

  getUsers(): Observable<Array<User>> {
    return this.http.get<Array<User>>(this.apiUrl + "/");
  }

  addUser(user: User): Observable<any> {
    return this.http.post(this.apiUrl + "/add", user);
  }
}
