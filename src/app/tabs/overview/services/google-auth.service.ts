import { Injectable, inject } from '@angular/core';

import type { GoogleResponse } from '../../../models';
import { AuthService, ToastService } from '../../../services';

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

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  initialize(): void {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: ({ credential }) => this.authenticate(credential),
    });
  }

  prompt(): void {
    google.accounts.id.prompt();
  }

  private authenticate(credential: string): void {
    this.authService.putAuthWithGoogle(credential).subscribe({
      error: async (error) => {
        console.error('Google login failed', error);
        await this.toastService.show('tabs.overview.actions.google-auth.error');
      },
    });
  }
}
