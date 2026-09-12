import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { IonToast } from '@ionic/angular/standalone';

import { ServerStartupService } from '../services';

@Component({
  selector: 'app-server-startup-overlay',
  standalone: true,
  imports: [IonToast],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    ion-toast.server-startup-toast {
      --background: var(--ion-item-background);
      --color: var(--ion-text-color);
      --border-radius: 0 0 var(--app-radius-1) var(--app-radius-1);
      --box-shadow: 0 6px 24px rgb(0 0 0 / 30%);
    }

    ion-toast.server-startup-toast::part(container) {
      display: grid;
      grid-template-columns: 12px 1fr;
      align-items: center;
      padding-inline: 15px;
      border-top: 4px solid var(--ion-color-primary);
    }

    ion-toast.server-startup-toast::part(container)::before,
    ion-toast.server-startup-toast::part(container)::after {
      grid-column: 1;
      grid-row: 1;
      justify-self: center;

      content: '';
      border-radius: 50%;
    }

    ion-toast.server-startup-toast::part(container)::after {
      width: 12px;
      height: 12px;
    }

    ion-toast.server-startup-toast--starting::part(container)::after {
      background: #ccc;
    }

    ion-toast.server-startup-toast--failed::part(container)::after {
      background: var(--ion-color-danger);
    }

    ion-toast.server-startup-toast--started::part(container)::after {
      background: var(--ion-color-success);
    }

    ion-toast.server-startup-toast--starting::part(container)::after {
      animation: status-pulse 1.5s ease-in-out infinite;
    }

    ion-toast.server-startup-toast::part(message) {
      grid-column: 2;

      margin: 0;
      text-align: left;
      white-space: pre-line;
      font-weight: 500;
    }

    ion-toast.server-startup-toast--starting::part(message)::after {
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
      class="server-startup-toast"
      [class.server-startup-toast--starting]="serverStartupService.status() === 'starting'"
      [class.server-startup-toast--started]="serverStartupService.status() === 'started'"
      [class.server-startup-toast--failed]="serverStartupService.status() === 'failed'"
      position="top"
      [isOpen]="isVisible()"
      [message]="message()"
    />
  `,
})
export class ServerStartupOverlayComponent {
  protected readonly serverStartupService = inject(ServerStartupService);

  protected readonly isVisible = computed<boolean>(
    () => this.serverStartupService.status() !== 'hidden',
  );

  protected readonly message = computed<string>(() => {
    switch (this.serverStartupService.status()) {
      case 'starting':
        return 'Verbindung wird hergestellt';

      case 'started':
        return 'Verbindung hergestellt';

      case 'failed':
        return 'Verbindung konnte nicht hergestellt werden';

      case 'hidden':
        return '';
    }
  });
}
