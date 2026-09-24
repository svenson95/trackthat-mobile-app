import { signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../../../../core';
import { GoogleAuthService } from '../../data-access';

import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;

  const isLoading = signal(false);

  const googleAuthServiceMock = {
    isNativeIos: false,
    initialize: vi.fn<() => Promise<void>>(),
    login: vi.fn<() => Promise<void>>(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    isLoading.set(false);
    googleAuthServiceMock.isNativeIos = false;
    googleAuthServiceMock.initialize.mockResolvedValue(undefined);
    googleAuthServiceMock.login.mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [LoginFormComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            isLoading,
          },
        },
        {
          provide: GoogleAuthService,
          useValue: googleAuthServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize Google auth after view init', async () => {
      fixture.detectChanges();

      await fixture.whenStable();

      expect(googleAuthServiceMock.initialize).toHaveBeenCalledOnce();
      expect(component.isGoogleReady()).toBe(true);
      expect(component.isGoogleInitializing()).toBe(false);
    });

    it('should mark Google auth as unavailable when initialization fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);

      googleAuthServiceMock.initialize.mockRejectedValue(new Error('Initialization failed'));

      fixture.detectChanges();

      await fixture.whenStable();

      expect(component.isGoogleReady()).toBe(false);
      expect(component.isGoogleInitializing()).toBe(false);
    });
  });

  describe('login', () => {
    it('should not login when Google auth is not ready', async () => {
      component.isGoogleReady.set(false);

      await component.loginWithGoogle();

      expect(googleAuthServiceMock.login).not.toHaveBeenCalled();
    });

    it('should login when Google auth is ready', async () => {
      component.isGoogleReady.set(true);

      await component.loginWithGoogle();

      expect(googleAuthServiceMock.login).toHaveBeenCalledOnce();
    });
  });

  describe('template', () => {
    it('should show the Google web button container outside native iOS', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('#web-google-button')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.native-google-button')).toBeNull();
    });

    it('should show the native Google login button on iOS', async () => {
      fixture.destroy();

      googleAuthServiceMock.isNativeIos = true;

      fixture = TestBed.createComponent(LoginFormComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.native-google-button')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('#web-google-button')).toBeNull();
    });

    it('should show a spinner while Google auth is initializing', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('ion-spinner')).not.toBeNull();
    });

    it('should hide the web Google button while Google auth is initializing', () => {
      fixture.detectChanges();

      const googleLogin = fixture.nativeElement.querySelector('.google-login');

      expect(googleLogin.classList.contains('google-login--initializing')).toBe(true);
    });

    it('should show the web Google button after initialization', async () => {
      fixture.detectChanges();

      await fixture.whenStable();
      fixture.detectChanges();

      const googleLogin = fixture.nativeElement.querySelector('.google-login');

      expect(googleLogin.classList.contains('google-login--initializing')).toBe(false);
      expect(fixture.nativeElement.querySelector('#web-google-button')).not.toBeNull();
    });

    it('should show a spinner while authentication is loading', async () => {
      component.isGoogleInitializing.set(false);
      isLoading.set(true);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('ion-spinner')).not.toBeNull();
    });

    it('should show an error when Google auth initialization failed', () => {
      component.isGoogleInitializing.set(false);
      component.isGoogleReady.set(false);

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(
        'Google Login konnte nicht geladen werden',
      );
    });
  });
});
