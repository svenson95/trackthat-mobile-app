import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { type Observable } from 'rxjs';

import { environment } from 'src/environments/environment.prod';

import type { AuthResponse, GoogleJWT, GoogleUser } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.api + 'auth';
  private http = inject(HttpClient);

  user = linkedSignal<GoogleUser | undefined>(() => {
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
    localStorage.setItem('authToken', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.user.set(res.user);
    this.isLoading.set(false);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.user.set(undefined);
  }
}
