import { DestroyRef, Injectable, inject } from '@angular/core';

import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';

import { AuthService } from '../../../core';
import { IonicUiService } from '../../../shared';

// https://developers.google.com/identity/gsi/web/reference/js-reference?hl=de
type GoogleResponse = {
  clientId: string;
  client_id: string;
  credential: string;
  select_by: string;
};

interface GoogleIdentityService {
  accounts: {
    id: {
      initialize(config: { client_id: string; callback: (response: GoogleResponse) => void }): void;
      prompt(): void;
      renderButton(
        parent: HTMLElement,
        options: {
          type?: 'standard' | 'icon';
          theme?: 'outline' | 'filled_blue' | 'filled_black';
          size?: 'large' | 'medium' | 'small';
          text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
          shape?: 'rectangular' | 'pill' | 'circle' | 'square';
          logo_alignment?: 'left' | 'center';
          width?: string | number;
        },
      ): void;
    };
  };
}

declare const google: GoogleIdentityService;

const GOOGLE_CLIENT_ID_WEB_APP =
  '81384485805-o4b55e424moljjf98egavlhol819l18a.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_IOS_APP =
  '81384485805-7hqlsavl3h01cj38ker2plgt2obvsen9.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: typeof google;
  }
}
@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  private readonly authService = inject(AuthService);
  private readonly ionicUiService = inject(IonicUiService);
  private readonly destroyRef = inject(DestroyRef);

  private darkModeQuery?: MediaQueryList;
  private isWebInitialized = false;

  private get isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  get isNativeIos(): boolean {
    return this.isNativePlatform && Capacitor.getPlatform() === 'ios';
  }

  async initialize(): Promise<void> {
    if (this.isNativePlatform) {
      await this.initializeNative();
      return;
    }

    await this.initializeWeb();
  }

  async login(): Promise<void> {
    if (this.isNativePlatform) {
      await this.loginNative();
      return;
    }

    this.promptWeb();
  }

  private async initializeWeb(): Promise<void> {
    await this.waitForGoogle();

    if (!this.isWebInitialized) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID_WEB_APP,
        callback: (response) => this.authenticate(response.credential),
      });

      this.darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleThemeChange = (event: MediaQueryListEvent): void => {
        if (document.getElementById('web-google-button')) {
          this.renderWebButton(event.matches);
        }
      };

      this.darkModeQuery.addEventListener('change', handleThemeChange);

      this.destroyRef.onDestroy(() => {
        this.darkModeQuery?.removeEventListener('change', handleThemeChange);
      });

      this.isWebInitialized = true;
    }

    this.renderWebButton(this.darkModeQuery?.matches ?? false);
  }

  private renderWebButton(isDarkMode: boolean): void {
    const button = document.getElementById('web-google-button');

    if (!button) {
      throw new Error('Google web button container not found');
    }

    button.replaceChildren();

    google.accounts.id.renderButton(button, {
      type: 'standard',
      theme: isDarkMode ? 'filled_black' : 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: Math.min(button.clientWidth, 300),
    });
  }

  private async initializeNative(): Promise<void> {
    await SocialLogin.initialize({
      google: {
        iOSClientId: GOOGLE_CLIENT_ID_IOS_APP,
        iOSServerClientId: GOOGLE_CLIENT_ID_WEB_APP,
        mode: 'online',
      },
    });
  }

  private async loginNative(): Promise<void> {
    try {
      const response = await SocialLogin.login({
        provider: 'google',
        options: {
          scopes: ['email', 'profile'],
        },
      });

      if (response.result.responseType !== 'online') {
        throw new Error('Expected Google online login response');
      }

      const idToken = response.result.idToken;

      if (!idToken) {
        throw new Error('Google ID token missing');
      }

      this.authenticate(idToken);
    } catch (error) {
      console.error('Google login failed', error);
      await this.ionicUiService.showError('tabs.overview.actions.google-auth.error');
    }
  }

  private promptWeb(): void {
    if (!window.google?.accounts?.id) {
      console.error('Google Identity Services ist noch nicht geladen.');
      return;
    }

    window.google.accounts.id.prompt();
  }

  private authenticate(credential: string): void {
    this.authService.putAuthWithGoogle(credential).subscribe({
      error: async (error) => {
        console.error('Google login failed', error);
        await this.ionicUiService.showError('tabs.overview.actions.google-auth.error');
      },
    });
  }

  private waitForGoogle(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      let attempts = 0;
      const maxAttempts = 50;

      const interval = setInterval(() => {
        attempts++;

        if (window.google?.accounts?.id) {
          clearInterval(interval);
          resolve();
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Google Identity Services script not loaded'));
        }
      }, 100);
    });
  }
}
