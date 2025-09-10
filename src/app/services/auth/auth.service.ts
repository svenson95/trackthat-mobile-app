import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { tap, type Observable } from 'rxjs';

import { environment } from '../../../environments/environment.prod';
import type { GetAuthBody, GetAuthResponse, GoogleJWT, JwtToken } from '../../models';
import { UserService } from '../database/user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.api + 'auth';

  private http = inject(HttpClient);
  private userService = inject(UserService);

  isLoading = signal<boolean>(false);
  isLoggedIn = computed<boolean>(() => !!this.userService.userData());

  private setToken(token: JwtToken): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): JwtToken | null {
    return localStorage.getItem('authToken');
  }

  putAuthWithGoogle(token: GoogleJWT): Observable<GetAuthResponse> {
    this.isLoading.set(true);
    const body: GetAuthBody = { token };
    return this.http
      .post<GetAuthResponse>(`${this.apiUrl}/google`, body, {
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(
        tap((res) => {
          this.setToken(res.token);
          this.userService.setUser(res.user);
          this.isLoading.set(false);
        }),
      );
  }

  getVerify(token: JwtToken): Observable<GetAuthResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get<GetAuthResponse>(`${this.apiUrl}/verify`, { headers }).pipe(
      tap((res) => {
        this.setToken(res.token);
        this.userService.setUser(res.user);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.userService.clearUser();
  }
}
