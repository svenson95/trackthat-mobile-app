import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

  const mediaQueryAddEventListener = vi.fn();
  const mediaQueryRemoveEventListener = vi.fn();

  let prefersDarkMode = false;
  let themeChangeListener: ((event: MediaQueryListEvent) => void) | undefined;

  const setWebPlatform = (): void => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    vi.mocked(Capacitor.getPlatform).mockReturnValue('web');
  };

  const setNativeIosPlatform = (): void => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    vi.mocked(Capacitor.getPlatform).mockReturnValue('ios');
  };

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

  const createGoogleButton = (): HTMLDivElement => {
    const button = document.createElement('div');

    button.id = 'web-google-button';

    Object.defineProperty(button, 'clientWidth', {
      configurable: true,
      value: 300,
    });

    document.body.appendChild(button);

    return button;
  };

  const createService = (): GoogleAuthService => TestBed.inject(GoogleAuthService);

  const emitThemeChange = (matches: boolean): void => {
    themeChangeListener?.({
      matches,
    } as MediaQueryListEvent);
  };

  beforeEach(() => {
    vi.clearAllMocks();

    prefersDarkMode = false;
    themeChangeListener = undefined;

    setWebPlatform();

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

    mediaQueryAddEventListener.mockImplementation(
      (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'change') {
          themeChangeListener = listener as (event: MediaQueryListEvent) => void;
        }
      },
    );

    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query): MediaQueryList =>
        ({
          matches: prefersDarkMode,
          media: query,
          onchange: null,
          addEventListener: mediaQueryAddEventListener,
          removeEventListener: mediaQueryRemoveEventListener,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );

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

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  describe('platform', () => {
    it('should expose native iOS state', () => {
      setNativeIosPlatform();

      const service = createService();

      expect(service.isNativeIos).toBe(true);
    });

    it('should not expose native iOS state on web', () => {
      setWebPlatform();

      const service = createService();

      expect(service.isNativeIos).toBe(false);
    });

    it('should not expose native iOS state on Android', () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android');

      const service = createService();

      expect(service.isNativeIos).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should initialize Google Identity Services on web', async () => {
      setGoogleIdentityService();

      const button = createGoogleButton();
      const service = createService();

      await service.initialize();

      expect(googleInitialize).toHaveBeenCalledOnce();

      expect(googleInitialize).toHaveBeenCalledWith({
        client_id: expect.any(String),
        callback: expect.any(Function),
      });

      expect(googleRenderButton).toHaveBeenCalledWith(button, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 300,
      });

      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(mediaQueryAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));

      expect(SocialLogin.initialize).not.toHaveBeenCalled();
    });

    it('should render the dark Google button when dark mode is preferred', async () => {
      prefersDarkMode = true;

      setGoogleIdentityService();

      const button = createGoogleButton();
      const service = createService();

      await service.initialize();

      expect(googleRenderButton).toHaveBeenCalledWith(
        button,
        expect.objectContaining({
          theme: 'filled_black',
        }),
      );
    });

    it('should rerender the Google button when the preferred color scheme changes', async () => {
      setGoogleIdentityService();

      const button = createGoogleButton();
      const service = createService();

      await service.initialize();

      googleRenderButton.mockClear();

      emitThemeChange(true);

      expect(googleRenderButton).toHaveBeenCalledOnce();

      expect(googleRenderButton).toHaveBeenCalledWith(
        button,
        expect.objectContaining({
          theme: 'filled_black',
        }),
      );

      googleRenderButton.mockClear();

      emitThemeChange(false);

      expect(googleRenderButton).toHaveBeenCalledWith(
        button,
        expect.objectContaining({
          theme: 'outline',
        }),
      );
    });

    it('should initialize Google Identity Services only once', async () => {
      setGoogleIdentityService();

      createGoogleButton();

      const service = createService();

      await service.initialize();
      await service.initialize();

      expect(googleInitialize).toHaveBeenCalledOnce();

      expect(mediaQueryAddEventListener).toHaveBeenCalledOnce();
      expect(googleRenderButton).toHaveBeenCalledTimes(2);
    });

    it('should initialize SocialLogin on native platforms', async () => {
      setNativeIosPlatform();

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
      expect(window.matchMedia).not.toHaveBeenCalled();
    });

    it('should throw when the Google web button container is missing', async () => {
      setGoogleIdentityService();

      const service = createService();

      await expect(service.initialize()).rejects.toThrow('Google web button container not found');
    });

    it('should authenticate with the credential returned by Google', async () => {
      setGoogleIdentityService();
      createGoogleButton();

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
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const service = createService();

      await service.login();

      expect(googlePrompt).not.toHaveBeenCalled();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Google Identity Services ist noch nicht geladen.',
      );
    });

    it('should login with Google on native platforms', async () => {
      setNativeIosPlatform();

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
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      setNativeIosPlatform();

      vi.mocked(SocialLogin.login).mockResolvedValue({
        provider: 'google',
        result: {
          responseType: 'online',
          idToken: null,
        },
      } as Awaited<ReturnType<typeof SocialLogin.login>>);

      const service = createService();

      await service.login();

      expect(authServiceMock.putAuthWithGoogle).not.toHaveBeenCalled();

      expect(ionicUiServiceMock.showError).toHaveBeenCalledWith(
        'tabs.overview.actions.google-auth.error',
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should show an error when native login fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      setNativeIosPlatform();

      const error = new Error('Google login failed');

      vi.mocked(SocialLogin.login).mockRejectedValue(error);

      const service = createService();

      await service.login();

      expect(authServiceMock.putAuthWithGoogle).not.toHaveBeenCalled();

      expect(ionicUiServiceMock.showError).toHaveBeenCalledWith(
        'tabs.overview.actions.google-auth.error',
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith('Google login failed', error);
    });

    it('should show an error when native login does not return an online response', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      setNativeIosPlatform();

      vi.mocked(SocialLogin.login).mockResolvedValue({
        provider: 'google',
        result: {
          responseType: 'offline',
        },
      } as Awaited<ReturnType<typeof SocialLogin.login>>);

      const service = createService();

      await service.login();

      expect(authServiceMock.putAuthWithGoogle).not.toHaveBeenCalled();

      expect(ionicUiServiceMock.showError).toHaveBeenCalledWith(
        'tabs.overview.actions.google-auth.error',
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('authentication', () => {
    it('should show an error when backend authentication fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      authServiceMock.putAuthWithGoogle.mockReturnValue(
        throwError(() => new Error('Backend error')),
      );

      setGoogleIdentityService();
      createGoogleButton();

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
