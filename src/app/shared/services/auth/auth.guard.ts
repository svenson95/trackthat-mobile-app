import { inject, Injectable } from '@angular/core';
import type { CanActivate } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  authService = inject(AuthService);
  router = inject(Router);

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      void this.router.navigate(['/']);
      return false;
    }
  }
}
