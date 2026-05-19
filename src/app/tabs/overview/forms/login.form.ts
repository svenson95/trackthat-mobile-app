import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';

import { AuthService } from '../../../services';
import { GoogleAuthService } from '../services';

@Component({
  selector: 'app-login-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonSpinner, IonIcon],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  `,
  template: `
    <ion-button
      data-test="google-login-btn"
      expand="block"
      color="danger"
      (click)="loginWithGoogle()"
      [disabled]="isLoading()"
    >
      @if (isLoading()) {
        <ion-spinner name="dots" />
      } @else {
        <ion-icon name="logo-google" slot="start" />
        <span>Mit Google anmelden</span>
      }
    </ion-button>
  `,
})
export class LoginForm implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly googleAuthService = inject(GoogleAuthService);

  readonly isLoading = this.authService.isLoading;

  ngOnInit(): void {
    this.googleAuthService.initialize();
  }

  loginWithGoogle(): void {
    this.googleAuthService.prompt();
  }
}
