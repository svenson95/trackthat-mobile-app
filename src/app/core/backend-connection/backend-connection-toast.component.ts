import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { AnimationController, IonToast, type Animation } from '@ionic/angular';

import {
  BackendConnectionService,
  type BackendConnectionStatus,
} from './backend-connection.service';

const SUCCESS_HOLD_DURATION = 700;
const LEAVE_ANIMATION_DURATION = 420;
const EXPECTED_CONNECTION_DURATION_SECONDS = 18;

@Component({
  selector: 'app-backend-connection-toast',
  standalone: true,
  imports: [IonToast],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    ion-toast.backend-connection-toast {
      --background: var(--ion-background-color);
      --color: var(--ion-text-color);
      --border-radius: 0 0 var(--app-radius-1) var(--app-radius-1);
      --box-shadow: 0 6px 24px rgb(0 0 0 / 25%);
    }

    ion-toast.backend-connection-toast::part(header),
    ion-toast.backend-connection-toast::part(message) {
      grid-column: 2;

      margin: 0;
      padding: 0;

      font-family: inherit;
      font-style: normal;
      letter-spacing: normal;
      text-align: left;
    }

    ion-toast.backend-connection-toast::part(header) {
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.35;
      color: var(--ion-text-color);
    }

    ion-toast.backend-connection-toast::part(message) {
      font-size: 0.75rem;
      font-weight: 400;
      line-height: 1.35;
      color: var(--ion-color-medium);
    }

    ion-toast.backend-connection-toast::part(container) {
      display: grid;
      grid-template-columns: 12px 1fr;
      align-items: center;
      padding-inline: 20px;
      border-top: 4px solid var(--ion-color-primary);
    }

    ion-toast.backend-connection-toast::part(container)::after {
      grid-column: 1;
      grid-row: 1 / span 2;
      justify-self: center;

      width: 12px;
      height: 12px;

      content: '';
      border-radius: 50%;
    }

    ion-toast.backend-connection-toast--connecting::part(container)::after {
      background: #ccc;
      animation: status-pulse 1.5s ease-in-out infinite;
    }

    ion-toast.backend-connection-toast--failed::part(container)::after {
      background: var(--ion-color-danger);
    }

    ion-toast.backend-connection-toast--connected::part(container)::after {
      background: var(--ion-color-success);
    }

    @keyframes status-pulse {
      0%,
      100% {
        opacity: 1;
      }

      50% {
        opacity: 0.4;
      }
    }
  `,
  template: `
    <ion-toast
      class="backend-connection-toast"
      [class.backend-connection-toast--connecting]="displayStatus() === 'connecting'"
      [class.backend-connection-toast--connected]="displayStatus() === 'connected'"
      [class.backend-connection-toast--failed]="displayStatus() === 'failed'"
      position="top"
      [isOpen]="isVisible()"
      [leaveAnimation]="leaveAnimation"
      [header]="header()"
      [message]="subheader()"
    />
  `,
})
export class BackendConnectionToastComponent {
  private readonly backendConnectionService = inject(BackendConnectionService);
  private readonly animationController = inject(AnimationController);

  protected readonly displayStatus = signal<BackendConnectionStatus>(
    this.backendConnectionService.status(),
  );

  protected readonly remainingSeconds = signal(EXPECTED_CONNECTION_DURATION_SECONDS);

  protected readonly isVisible = computed<boolean>(() => this.displayStatus() !== 'hidden');

  protected readonly header = computed<string>(() => {
    switch (this.displayStatus()) {
      case 'connecting':
        return 'Verbindung wird hergestellt';

      case 'connected':
        return 'Verbindung hergestellt';

      case 'failed':
        return 'Verbindung konnte nicht hergestellt werden';

      case 'hidden':
        return '';
    }
  });

  protected readonly subheader = computed<string>(() => {
    switch (this.displayStatus()) {
      case 'connecting': {
        const seconds = this.remainingSeconds();

        if (seconds === 0) {
          return 'Verbindung dauert etwas länger …';
        }

        return `Durchschnittliche Wartezeit: ${seconds} ${seconds === 1 ? 'Sekunde' : 'Sekunden'}`;
      }

      case 'failed':
        return 'Bitte versuche es in wenigen Augenblicken erneut.';

      case 'connected':
      case 'hidden':
        return '';
    }
  });

  protected readonly leaveAnimation = (baseElement: HTMLElement): Animation =>
    this.animationController
      .create()
      .addElement(baseElement)
      .duration(LEAVE_ANIMATION_DURATION)
      .easing('cubic-bezier(0.32, 0.72, 0, 1)')
      .fromTo('transform', 'translateY(0)', 'translateY(-120px)');

  private readonly countdownEffect = effect((onCleanup) => {
    const status = this.backendConnectionService.status();

    if (status !== 'connecting') {
      return;
    }

    this.remainingSeconds.set(EXPECTED_CONNECTION_DURATION_SECONDS);

    const interval = setInterval(() => {
      this.remainingSeconds.update((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

  private readonly displayStatusEffect = effect((onCleanup) => {
    const status = this.backendConnectionService.status();

    if (status !== 'hidden') {
      this.displayStatus.set(status);
      return;
    }

    const currentDisplayStatus = untracked(() => this.displayStatus());

    if (currentDisplayStatus !== 'connected') {
      this.displayStatus.set('hidden');
      return;
    }

    const timeout = setTimeout(() => {
      this.displayStatus.set('hidden');
    }, SUCCESS_HOLD_DURATION);

    onCleanup(() => clearTimeout(timeout));
  });
}
