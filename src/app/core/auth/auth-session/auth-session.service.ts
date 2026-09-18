import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { IonicUiService } from '../../../shared';

import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private readonly router = inject(Router);

  private readonly ionicUiService = inject(IonicUiService);
  private readonly authService = inject(AuthService);

  verifySession(): void {
    const token = this.authService.getToken();

    if (!token) {
      return;
    }

    this.authService.getVerify(token).subscribe({
      error: async () => {
        await this.ionicUiService.showError('general.actions.verify.error');

        this.authService.logout();

        await this.router.navigate(['/']);
      },
    });
  }
}
