import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  type AfterViewInit,
} from '@angular/core';
import { IonSpinner } from '@ionic/angular';

import { AuthService } from '../../../../core';
import { GoogleAuthService } from '../../data-access';

@Component({
  selector: 'app-login-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonSpinner],
  styles: `
    :host {
      display: flex;
      width: 100%;
      flex-direction: column;
      gap: 10px;
    }

    #google-button,
    .ios-google-button {
      margin: 1rem auto;
    }

    .ios-google-button {
      padding: 1rem;
    }

    ion-spinner {
      margin: 1rem auto;
    }
  `,
  template: `
    @if (!isLoading()) {
      @if (isNativeIos) {
        <button class="ios-google-button" type="button" (click)="loginWithGoogle()">
          Mit Google anmelden
        </button>
      } @else {
        <div id="google-button"></div>
      }
    }

    @if (isGoogleInitializing() || isLoading()) {
      <ion-spinner />
    }

    @if (!isGoogleInitializing() && !isGoogleReady()) {
      <p>Google Login konnte nicht geladen werden</p>
    }
  `,
})
export class LoginFormComponent implements AfterViewInit {
  private readonly authService = inject(AuthService);
  private readonly googleAuthService = inject(GoogleAuthService);

  readonly isLoading = this.authService.isLoading;
  readonly isNativeIos = this.googleAuthService.isNativeIos;

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

  async loginWithGoogle(): Promise<void> {
    if (!this.isGoogleReady()) {
      return;
    }

    await this.googleAuthService.login();
  }
}
