import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { appRoutes } from '../../../app.routes';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;

  const authServiceMock = {
    isLoggedIn: signal(false),
  };

  beforeEach(() => {
    authServiceMock.isLoggedIn.set(false);

    TestBed.configureTestingModule({
      providers: [
        provideRouter(appRoutes),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('should redirect when not authenticated', () => {
    const result = guard.canActivate();

    expect(result).toEqual(router.createUrlTree(['/']));
  });

  it('should allow navigation when authenticated', () => {
    authServiceMock.isLoggedIn.set(true);

    const result = guard.canActivate();

    expect(result).toBe(true);
  });
});
