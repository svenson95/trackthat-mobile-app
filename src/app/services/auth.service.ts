import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import { tap, type Observable } from 'rxjs';

import { environment } from 'src/environments/environment.prod';

import type { AuthResponse, GoogleJWT, GoogleUser } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.api + 'auth';
  private http = inject(HttpClient);

  user = linkedSignal<GoogleUser>(() => {
    const token = localStorage.getItem('user');
    if (!token) return undefined;
    return JSON.parse(token);
  });

  isLoggedIn = computed(() => this.user() !== undefined);

  loginViaEmail(): void {
    // TODO: implement register and login via email (2)
  }

  loginViaGoogle(token: GoogleJWT): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(this.apiUrl + '/google', token)
      .pipe(tap((res) => this.login(res)));
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  private login(res: AuthResponse): void {
    localStorage.setItem('authToken', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.user.set(res.user);
  }
}
