import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
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
    <form (ngSubmit)="onLogin()" [formGroup]="loginForm">
      <div class="login-inputs">
        <ion-item>
          <ion-label position="fixed">Email</ion-label>
          <ion-input type="email" formControlName="email"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="fixed">Passwort</ion-label>
          <ion-input type="password" formControlName="password"></ion-input>
        </ion-item>
      </div>

      <ion-button expand="block" type="submit" [disabled]="loginForm.invalid"> Login </ion-button>
    </form>

    <ion-button expand="block" color="danger" (click)="loginWithGoogle()">
      <ion-icon name="logo-google" slot="start"></ion-icon>
      Mit Google anmelden
    </ion-button>
  `,
})
export class LoginForm implements OnInit {
  private fb = inject(FormBuilder);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: '81384485805-o4b55e424moljjf98egavlhol819l18a.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleResponse(response),
    });
  }

  onLogin(): void {
    const { email, password } = this.loginForm.value;
    console.log('Login ...', email, password);
  }

  loginWithGoogle(): void {
    google.accounts.id.prompt();
  }

  handleGoogleResponse(response: any): void {
    console.log('Google response:', response);
    console.log('Google Token:', response.credential);
    // Token an dein Backend schicken
  }
}
