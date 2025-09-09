import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { type Observable } from 'rxjs';

import { environment } from '../../../environments/environment.prod';
import type { GetAuthBody, GetAuthResponse, GoogleJWT, JwtToken, UserDoc } from '../../models';

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

  loginWithGoogleToken(token: GoogleJWT): Observable<GetAuthResponse> {
    this.isLoading.set(true);
    const body: GetAuthBody = { token };
    return this.http.post<GetAuthResponse>(this.apiUrl + '/google', body, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  login(res: GetAuthResponse): void {
    this.setUserData(res.user);
    this.setToken(res.token);
    this.isLoading.set(false);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.user.set(undefined);
  }

  setToken(token: JwtToken): void {
    localStorage.setItem('authToken', token);
  }

  setUserData(user: UserDoc): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.user.set(user);
  }

  verify(token: JwtToken): Observable<GetAuthResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get<GetAuthResponse>(`${this.apiUrl}/verify`, { headers });
  }
}
