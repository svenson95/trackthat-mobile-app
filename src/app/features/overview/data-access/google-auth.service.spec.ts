import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';

import { AuthService } from '../../../core';
import { IonicUiService } from '../../../shared';

import { GoogleAuthService } from './google-auth.service';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: vi.fn(),
    isNativePlatform: vi.fn(),
  },
}));

vi.mock('@capgo/capacitor-social-login', () => ({
  SocialLogin: {
    initialize: vi.fn(),
    login: vi.fn(),
  },
}));

describe('GoogleAuthService', () => {
  const authServiceMock = {
    putAuthWithGoogle: vi.fn(),
  };

  const ionicUiServiceMock = {
    showError: vi.fn(),
  };

  const googleInitialize = vi.fn();
  const googlePrompt = vi.fn();
  const googleRenderButton = vi.fn();

  const setGoogleIdentityService = (): void => {
    window.google = {
      accounts: {
        id: {
          initialize: googleInitialize,
          prompt: googlePrompt,
          renderButton: googleRenderButton,
        },
      },
    };
  };

  const createService = (): GoogleAuthService => TestBed.inject(GoogleAuthService);

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(Capacitor.getPlatform).mockReturnValue('web');
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

    vi.mocked(SocialLogin.initialize).mockResolvedValue();
    vi.mocked(SocialLogin.login).mockResolvedValue({
      provider: 'google',
      result: {
        responseType: 'online',
        idToken: 'google-id-token',
      },
    } as Awaited<ReturnType<typeof SocialLogin.login>>);

    authServiceMock.putAuthWithGoogle.mockReturnValue(of(undefined));
    ionicUiServiceMock.showError.mockResolvedValue(undefined);

    document.body.innerHTML = '';
    window.google = undefined;

    TestBed.configureTestingModule({
      providers: [
        GoogleAuthService,
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: IonicUiService,
          useValue: ionicUiServiceMock,
        },
      ],
    });
  });

  describe('platform', () => {
    it('should expose native iOS state', () => {
      vi.mocked(Capacitor.getPlatform).mockReturnValue('ios');

      const service = createService();

      expect(service.isNativeIos).toBe(true);
    });

    it('should not expose native iOS state on web', () => {
      const service = createService();

      expect(service.isNativeIos).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should initialize Google Identity Services on web', async () => {
      setGoogleIdentityService();

      const button = document.createElement('div');
      button.id = 'google-button';
      document.body.appendChild(button);

      const service = createService();

      await service.initialize();

      expect(googleInitialize).toHaveBeenCalledOnce();
      expect(googleInitialize).toHaveBeenCalledWith({
        client_id: expect.any(String),
        callback: expect.any(Function),
      });

      expect(googleRenderButton).toHaveBeenCalledWith(button, {
        theme: 'filled_blue',
        size: 'large',
        type: 'standard',
        text: 'signup_with',
      });

      expect(SocialLogin.initialize).not.toHaveBeenCalled();
    });

    it('should initialize SocialLogin on native platforms', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Capacitor.getPlatform).mockReturnValue('ios');

      const service = createService();

      await service.initialize();

      expect(SocialLogin.initialize).toHaveBeenCalledWith({
        google: {
          iOSClientId: expect.any(String),
          iOSServerClientId: expect.any(String),
          mode: 'online',
        },
      });

      expect(googleInitialize).not.toHaveBeenCalled();
    });

    it('should throw when the Google button container is missing', async () => {
      setGoogleIdentityService();

      const service = createService();

      await expect(service.initialize()).rejects.toThrow('Google button container not found');
    });

    it('should authenticate with the credential returned by Google', async () => {
      setGoogleIdentityService();

      const button = document.createElement('div');
      button.id = 'google-button';
      document.body.appendChild(button);

      const service = createService();

      await service.initialize();

      const config = googleInitialize.mock.calls[0][0];

      config.callback({
        clientId: 'client-id',
        client_id: 'client-id',
        credential: 'web-google-token',
        select_by: 'btn',
      });

      expect(authServiceMock.putAuthWithGoogle).toHaveBeenCalledWith('web-google-token');
    });
  });

  describe('login', () => {
    it('should prompt Google Identity Services on web', async () => {
      setGoogleIdentityService();

      const service = createService();

      await service.login();

      expect(googlePrompt).toHaveBeenCalledOnce();
      expect(SocialLogin.login).not.toHaveBeenCalled();
    });

    it('should not prompt when Google Identity Services is unavailable', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const service = createService();

      await service.login();

      expect(googlePrompt).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalledWith('Google Identity Services ist noch nicht geladen.');
    });

    it('should login with Google on native platforms', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);

      const service = createService();

      await service.login();

      expect(SocialLogin.login).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          scopes: ['email', 'profile'],
        },
      });

      expect(authServiceMock.putAuthWithGoogle).toHaveBeenCalledWith('google-id-token');
    });

    it('should show an error when native login returns no id token', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      vi.mocked(SocialLogin.login).mockResolvedValue({
        provider: 'google',
        result: {
          responseType: 'online',
          idToken: null,
        },
      } as Awaited<ReturnType<typeof SocialLogin.login>>);

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);

      const service = createService();

      await service.login();

      expect(authServiceMock.putAuthWithGoogle).not.toHaveBeenCalled();

      expect(ionicUiServiceMock.showError).toHaveBeenCalledWith(
        'tabs.overview.actions.google-auth.error',
      );

      expect(consoleError).toHaveBeenCalled();
    });

    it('should show an error when native login fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      vi.mocked(SocialLogin.login).mockRejectedValue(new Error('Google login failed'));

      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);

      const service = createService();

      await service.login();

      expect(authServiceMock.putAuthWithGoogle).not.toHaveBeenCalled();

      expect(ionicUiServiceMock.showError).toHaveBeenCalledWith(
        'tabs.overview.actions.google-auth.error',
      );
    });
  });

  describe('authentication', () => {
    it('should show an error when backend authentication fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      authServiceMock.putAuthWithGoogle.mockReturnValue(
        throwError(() => new Error('Backend error')),
      );

      setGoogleIdentityService();

      const button = document.createElement('div');
      button.id = 'google-button';
      document.body.appendChild(button);

      const service = createService();

      await service.initialize();

      const config = googleInitialize.mock.calls[0][0];

      config.callback({
        clientId: 'client-id',
        client_id: 'client-id',
        credential: 'google-token',
        select_by: 'btn',
      });

      await Promise.resolve();

      expect(authServiceMock.putAuthWithGoogle).toHaveBeenCalledWith('google-token');

      expect(ionicUiServiceMock.showError).toHaveBeenCalledWith(
        'tabs.overview.actions.google-auth.error',
      );
    });
  });
});
