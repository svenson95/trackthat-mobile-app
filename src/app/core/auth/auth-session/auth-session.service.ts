import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HelperService } from '../../../shared';

import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private readonly router = inject(Router);

  private readonly helperService = inject(HelperService);
  private readonly authService = inject(AuthService);

  verifySession(): void {
    const token = this.authService.getToken();

    if (!token) {
      return;
    }

    this.authService.getVerify(token).subscribe({
      error: async () => {
        await this.helperService.showError('general.actions.verify.error');

        this.authService.logout();

        await this.router.navigate(['/']);
      },
    });
  }
}
