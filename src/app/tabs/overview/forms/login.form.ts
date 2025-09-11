import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import type { GoogleResponse } from '../../../models';
import { AuthService } from '../../../services';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const google: any;

@Component({
  selector: 'app-login-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IonicModule],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .login-inputs {
      min-width: 300px;
      margin-bottom: 20px;
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
        <ion-spinner name="dots"></ion-spinner>
      } @else {
        <ion-icon name="logo-google" slot="start"></ion-icon>
        <span>Mit Google anmelden</span>
      }
    </ion-button>
  `,
})
export class LoginForm implements OnInit {
  private authService = inject(AuthService);
  isLoading = this.authService.isLoading;

  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: '81384485805-o4b55e424moljjf98egavlhol819l18a.apps.googleusercontent.com',
      callback: (res: GoogleResponse) =>
        this.authService.putAuthWithGoogle(res.credential).subscribe({
          error: (err) => console.error('Google login failed', err),
        }),
    });
  }

  loginWithGoogle(): void {
    google.accounts.id.prompt();
  }
}
