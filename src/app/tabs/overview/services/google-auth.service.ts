import { Injectable, inject } from '@angular/core';

import type { GoogleResponse } from '../../../models';
import { AuthService, HelperService } from '../../../services';

interface GoogleIdentityService {
  accounts: {
    id: {
      initialize(config: { client_id: string; callback: (response: GoogleResponse) => void }): void;
      prompt(): void;
    };
  };
}

declare const google: GoogleIdentityService;

const GOOGLE_CLIENT_ID = '81384485805-o4b55e424moljjf98egavlhol819l18a.apps.googleusercontent.com';

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
  private readonly helperService = inject(HelperService);

  async initialize(): Promise<void> {
    await this.waitForGoogle();

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: ({ credential }) => this.authenticate(credential),
    });
  }

  prompt(): void {
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
        await this.helperService.showError('tabs.overview.actions.google-auth.error');
      },
    });
  }

  private waitForGoogle(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      const maxAttempts = 50;
      let attempts = 0;

      const interval = setInterval(() => {
        attempts++;

        if (window.google?.accounts?.id) {
          clearInterval(interval);
          resolve();
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Google Identity Services script not loaded'));
        }
      }, 100);
    });
  }
}
