import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IonicUiService } from '../../../shared';

import type { GetAuthResponse, JwtToken } from '../service/auth.service';
import { AuthService } from '../service/auth.service';
import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {
  let service: AuthSessionService;

  const authServiceMock = {
    getToken: vi.fn(),
    getVerify: vi.fn(),
    logout: vi.fn(),
  };

  const helperServiceMock = {
    showError: vi.fn(),
  };

  const routerMock = {
    navigate: vi.fn(),
  };

  beforeEach(() => {
    authServiceMock.getToken.mockReset();
    authServiceMock.getVerify.mockReset();
    authServiceMock.logout.mockReset();

    helperServiceMock.showError.mockReset();
    routerMock.navigate.mockReset();

    helperServiceMock.showError.mockResolvedValue(undefined);
    routerMock.navigate.mockResolvedValue(true);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: IonicUiService,
          useValue: helperServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    });

    service = TestBed.inject(AuthSessionService);
  });

  describe('verifySession', () => {
    it('should do nothing when no auth token exists', () => {
      authServiceMock.getToken.mockReturnValue(null);

      service.verifySession();

      expect(authServiceMock.getVerify).not.toHaveBeenCalled();
      expect(helperServiceMock.showError).not.toHaveBeenCalled();
      expect(authServiceMock.logout).not.toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should verify the session when an auth token exists', () => {
      const token = 'auth-token' as JwtToken;

      authServiceMock.getToken.mockReturnValue(token);
      authServiceMock.getVerify.mockReturnValue(of({} as GetAuthResponse));

      service.verifySession();

      expect(authServiceMock.getVerify).toHaveBeenCalledOnce();
      expect(authServiceMock.getVerify).toHaveBeenCalledWith(token);

      expect(helperServiceMock.showError).not.toHaveBeenCalled();
      expect(authServiceMock.logout).not.toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should show an error, log out and navigate home when verification fails', async () => {
      const token = 'auth-token' as JwtToken;

      authServiceMock.getToken.mockReturnValue(token);
      authServiceMock.getVerify.mockReturnValue(throwError(() => new Error('Verification failed')));

      service.verifySession();

      await vi.waitFor(() => {
        expect(helperServiceMock.showError).toHaveBeenCalledWith('general.actions.verify.error');

        expect(authServiceMock.logout).toHaveBeenCalledOnce();

        expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
      });
    });
  });
});
