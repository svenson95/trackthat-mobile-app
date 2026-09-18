import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../../environments/environment';
import { UserService } from '../../database';

import type { GetAuthResponse, GoogleJWT, JwtToken } from './auth.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  const userData = signal<GetAuthResponse['user'] | null>(null);

  const userServiceMock = {
    userData,
    setUser: vi.fn(),
    clearUser: vi.fn(),
  };

  const responseUser = {
    id: '1',
    googleId: 'google-id',
    name: 'Test User',
    picture: 'https://example.com/avatar.jpg',
    email: 'test@example.com',
  } satisfies GetAuthResponse['user'];

  const response: GetAuthResponse = {
    token: 'jwt-token',
    user: responseUser,
  };

  beforeEach(() => {
    localStorage.clear();

    userData.set(null);

    userServiceMock.setUser.mockReset();
    userServiceMock.clearUser.mockReset();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  describe('isLoggedIn', () => {
    it('should be false when no user exists', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should be true when a user exists', () => {
      userData.set(response.user);

      expect(service.isLoggedIn()).toBe(true);
    });
  });

  describe('getToken', () => {
    it('should return the stored auth token', () => {
      localStorage.setItem('authToken', 'stored-token');

      expect(service.getToken()).toBe('stored-token');
    });

    it('should return null when no auth token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('putAuthWithGoogle', () => {
    it('should authenticate with Google and store the session', () => {
      const googleToken = 'google-token' as GoogleJWT;

      service.putAuthWithGoogle(googleToken).subscribe();

      expect(service.isLoading()).toBe(true);

      const request = httpTesting.expectOne(`${environment.api}auth/google`);

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual({
        token: googleToken,
      });
      expect(request.request.headers.get('Content-Type')).toBe('application/json');

      request.flush(response);

      expect(localStorage.getItem('authToken')).toBe(response.token);
      expect(userServiceMock.setUser).toHaveBeenCalledOnce();
      expect(userServiceMock.setUser).toHaveBeenCalledWith(response.user);
      expect(service.isLoading()).toBe(false);
    });

    it('should reset loading state when authentication fails', () => {
      const googleToken = 'google-token' as GoogleJWT;

      service.putAuthWithGoogle(googleToken).subscribe({
        error: () => undefined,
      });

      expect(service.isLoading()).toBe(true);

      const request = httpTesting.expectOne(`${environment.api}auth/google`);

      request.flush(
        { message: 'Unauthorized' },
        {
          status: 401,
          statusText: 'Unauthorized',
        },
      );

      expect(service.isLoading()).toBe(false);
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(userServiceMock.setUser).not.toHaveBeenCalled();
    });
  });

  describe('getVerify', () => {
    it('should verify the session and update the stored session', () => {
      const token = 'existing-token' as JwtToken;

      service.getVerify(token).subscribe();

      const request = httpTesting.expectOne(`${environment.api}auth/verify`);

      expect(request.request.method).toBe('GET');
      expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      expect(request.request.headers.get('Content-Type')).toBe('application/json');

      request.flush(response);

      expect(localStorage.getItem('authToken')).toBe(response.token);
      expect(userServiceMock.setUser).toHaveBeenCalledOnce();
      expect(userServiceMock.setUser).toHaveBeenCalledWith(response.user);
    });
  });

  describe('logout', () => {
    it('should remove the auth token and clear the user', () => {
      localStorage.setItem('authToken', 'stored-token');

      service.logout();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(userServiceMock.clearUser).toHaveBeenCalledOnce();
    });
  });
});
