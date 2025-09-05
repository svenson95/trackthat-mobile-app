import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { type Observable } from 'rxjs';

import { environment } from '../../environments/environment.prod';
import type { AuthResponse, GoogleJWT, UserDoc } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.api + 'auth';
  private http = inject(HttpClient);

  user = linkedSignal<undefined | UserDoc>(() => {
    const token = localStorage.getItem('user');
    if (!token) return undefined;
    return JSON.parse(token);
  });

  isLoading = signal<boolean>(false);
  isLoggedIn = computed(() => this.user() !== undefined);

  loginWithGoogleToken(token: GoogleJWT): Observable<AuthResponse> {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(
      this.apiUrl + '/google',
      { token },
      { headers: { 'Content-Type': 'application/json' } },
    );
  }

  login(res: AuthResponse): void {
    this.setUserData(res.user);
    this.isLoading.set(false);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.user.set(undefined);
  }

  setUserData(user: UserDoc): void {
    const token = localStorage.getItem('authToken')!;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.user.set(user);
  }
}
