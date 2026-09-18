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

    ion-toast.backend-connection-toast::part(container) {
      display: grid;
      grid-template-columns: 12px 1fr;
      align-items: center;
      padding-inline: 15px;
      border-top: 4px solid var(--ion-color-primary);
    }

    ion-toast.backend-connection-toast::part(container)::before,
    ion-toast.backend-connection-toast::part(container)::after {
      grid-column: 1;
      grid-row: 1;
      justify-self: center;

      content: '';
      border-radius: 50%;
    }

    ion-toast.backend-connection-toast::part(container)::after {
      width: 12px;
      height: 12px;
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

    ion-toast.backend-connection-toast::part(message) {
      grid-column: 2;

      margin: 0;
      text-align: left;
      white-space: pre-line;
      font-weight: 500;
    }

    ion-toast.backend-connection-toast--connecting::part(message)::after {
      display: inline-block;
      width: 1.5em;
      content: '';
      animation: loading-dots 1.6s steps(1, end) infinite;
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

    @keyframes loading-dots {
      0%,
      100% {
        content: '';
      }

      25% {
        content: '.';
      }

      50% {
        content: '..';
      }

      75% {
        content: '...';
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
      [message]="message()"
    />
  `,
})
export class BackendConnectionToastComponent {
  private readonly backendConnectionService = inject(BackendConnectionService);
  private readonly animationController = inject(AnimationController);

  protected readonly displayStatus = signal<BackendConnectionStatus>(
    this.backendConnectionService.status(),
  );

  protected readonly isVisible = computed<boolean>(() => this.displayStatus() !== 'hidden');

  protected readonly message = computed<string>(() => {
    switch (this.displayStatus()) {
      case 'connecting':
        return 'Verbindung zur Datenbank wird hergestellt';

      case 'connected':
        return 'Verbindung hergestellt';

      case 'failed':
        return 'Verbindung zur Datenbank konnte nicht hergestellt werden';

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
