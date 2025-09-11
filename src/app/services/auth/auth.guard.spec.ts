import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { appRoutes } from '../../app.routes';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;
  const authServiceMock = { isLoggedIn: signal<boolean>(false) };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideRouter(appRoutes), { provide: AuthService, useValue: authServiceMock }],
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should block navigation when not authenticated', () => {
    const result = guard.canActivate();
    expect(result).not.toBeTrue();
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should allow navigation when authenticated', () => {
    authServiceMock.isLoggedIn.set(true);
    const result = guard.canActivate();
    expect(result).not.toBeFalse();
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalledWith(['/']);
  });
});
