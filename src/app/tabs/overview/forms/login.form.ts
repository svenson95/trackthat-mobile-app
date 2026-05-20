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
      margin: 1rem auto 0;
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
      this.waitForGoogleIframeAndStyle();
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

  private waitForGoogleIframeAndStyle(): void {
    let attempts = 0;
    const maxAttempts = 20;

    const intervalId = window.setInterval(() => {
      attempts++;

      const iframe = document.querySelector<HTMLIFrameElement>('#google-button iframe');

      if (iframe) {
        window.clearInterval(intervalId);
        this.styleGoogleButtonIframe();
      }

      if (attempts >= maxAttempts) {
        window.clearInterval(intervalId);
      }
    }, 100);
  }

  private styleGoogleButtonIframe(): void {
    const iframe = document.querySelector<HTMLIFrameElement>('#google-button iframe');
    if (!iframe) return;

    iframe.style.margin = '0';

    try {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDocument) return;

      const applyStyles = (): void => {
        const html = iframeDocument.documentElement;
        const container = iframeDocument.querySelector<HTMLElement>('body .container-div');

        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.style.background = isDark ? '#1c1c1d' : 'white';

        if (container) {
          container.style.padding = '0';
          container.style.width = '100%';
        }
      };

      applyStyles();
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyStyles);
    } catch (error) {
      console.warn('Iframe styling nicht möglich, vermutlich wegen Cross-Origin iframe.', error);
    }
  }
}
