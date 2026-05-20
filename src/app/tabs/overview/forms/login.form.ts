import type { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IonSpinner } from '@ionic/angular/standalone';

import { AuthService } from '../../../services';
import { GoogleAuthService } from '../services';

@Component({
  selector: 'app-login-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonSpinner],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    #google-button {
      margin-top: 1rem;
      margin: auto;
    }
  `,
  template: `
    <div id="google-button"></div>

    @if (isGoogleInitializing()) {
      <ion-spinner></ion-spinner>
    }

    @if (!isGoogleInitializing() && !isGoogleReady()) {
      <p>Google Login konnte nicht geladen werden</p>
    }
  `,
})
export class LoginForm implements AfterViewInit {
  private readonly authService = inject(AuthService);
  private readonly googleAuthService = inject(GoogleAuthService);

  readonly isLoading = this.authService.isLoading;

  readonly isGoogleReady = signal(false);
  readonly isGoogleInitializing = signal(true);

  async ngAfterViewInit(): Promise<void> {
    try {
      await this.googleAuthService.initialize();
      this.isGoogleReady.set(true);
    } catch (error) {
      console.error('Google Auth konnte nicht initialisiert werden:', error);
      this.isGoogleReady.set(false);
    } finally {
      this.isGoogleInitializing.set(false);
    }
  }

  loginWithGoogle(): void {
    if (!this.isGoogleReady()) return;

    this.googleAuthService.prompt();
  }
}
