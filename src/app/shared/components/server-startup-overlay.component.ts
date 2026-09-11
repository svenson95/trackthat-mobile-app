import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonBackdrop } from '@ionic/angular/standalone';

import { ServerStartupService } from '../services';

@Component({
  selector: 'app-server-startup-overlay',
  standalone: true,
  imports: [IonBackdrop],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .server-startup-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;

      display: flex;
      align-items: center;
      justify-content: center;
    }

    ion-backdrop {
      background: #000;
      opacity: 0.35;
    }

    .server-startup-card {
      position: relative;
      z-index: 3;

      display: flex;
      align-items: center;
      gap: 12px;

      max-width: calc(100% - 32px);
      padding: 18px 24px;

      background: var(--ion-background-color);
      border-radius: 12px;

      box-shadow: 0 4px 20px rgb(0 0 0 / 20%);

      font-weight: 500;
    }

    .status-dot {
      flex: 0 0 auto;

      width: 10px;
      height: 10px;

      border-radius: 50%;
    }

    .status-dot--starting,
    .status-dot--failed {
      background: var(--ion-color-danger);
    }

    .status-dot--starting {
      animation: status-pulse 1.5s ease-in-out infinite;
    }

    .status-dot--started {
      background: var(--ion-color-success);
    }

    .loading-dots {
      display: inline-flex;
      width: 1.2em;
    }

    .loading-dot {
      opacity: 0;
    }

    .loading-dot:nth-child(1) {
      animation: loading-dot-1 1.6s infinite;
    }

    .loading-dot:nth-child(2) {
      animation: loading-dot-2 1.6s infinite;
    }

    .loading-dot:nth-child(3) {
      animation: loading-dot-3 1.6s infinite;
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

    @keyframes loading-dot-1 {
      0%,
      10% {
        opacity: 0;
      }

      15%,
      75% {
        opacity: 1;
      }

      80%,
      100% {
        opacity: 0;
      }
    }

    @keyframes loading-dot-2 {
      0%,
      30% {
        opacity: 0;
      }

      35%,
      75% {
        opacity: 1;
      }

      80%,
      100% {
        opacity: 0;
      }
    }

    @keyframes loading-dot-3 {
      0%,
      50% {
        opacity: 0;
      }

      55%,
      75% {
        opacity: 1;
      }

      80%,
      100% {
        opacity: 0;
      }
    }
  `,
  template: `
    @if (serverStartupService.status() !== 'hidden') {
      <div class="server-startup-overlay">
        <ion-backdrop [tappable]="false" />

        <div class="server-startup-card" role="status" aria-live="polite">
          <span
            class="status-dot"
            [class.status-dot--starting]="serverStartupService.status() === 'starting'"
            [class.status-dot--started]="serverStartupService.status() === 'started'"
            [class.status-dot--failed]="serverStartupService.status() === 'failed'"
          ></span>

          @switch (serverStartupService.status()) {
            @case ('starting') {
              <span>
                Server wird gestartet<span class="loading-dots" aria-hidden="true">
                  <span class="loading-dot">.</span>
                  <span class="loading-dot">.</span>
                  <span class="loading-dot">.</span>
                </span>
              </span>
            }

            @case ('started') {
              <span>Server gestartet</span>
            }

            @case ('failed') {
              <span>Server konnte nicht erreicht werden</span>
            }
          }
        </div>
      </div>
    }
  `,
})
export class ServerStartupOverlayComponent {
  protected readonly serverStartupService = inject(ServerStartupService);
}
