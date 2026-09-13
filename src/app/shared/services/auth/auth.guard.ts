import { inject, Injectable } from '@angular/core';
import { Router, type CanActivate, type UrlTree } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean | UrlTree {
    return this.authService.isLoggedIn() ? true : this.router.createUrlTree(['/']);
  }
}
