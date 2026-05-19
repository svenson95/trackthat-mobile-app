import { inject, Injectable } from '@angular/core';
import type { VersionEvent } from '@angular/service-worker';
import { SwUpdate } from '@angular/service-worker';
import { AlertController } from '@ionic/angular';

import { AuthService } from './auth/auth.service';
import { ToastService } from './toast.service';

const ALERT_OPTIONS = {
  header: 'Update verfügbar',
  message: 'Eine neue Version der App ist verfügbar',
  buttons: [
    {
      text: 'Später',
      role: 'cancel',
    },
    {
      text: 'Neu laden',
      handler: (): void => document.location.reload(),
    },
  ],
};

@Injectable()
export class AppService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly alertCtrl = inject(AlertController);

  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  getVersionUpdates(): void {
    this.swUpdate.versionUpdates.subscribe(async (event: VersionEvent) => {
      if (event.type === 'VERSION_READY') {
        const alert = await this.alertCtrl.create(ALERT_OPTIONS);
        await alert.present();
      }
    });
  }

  updateUserData(): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.authService.getVerify(token).subscribe({
      error: async (error) => {
        console.error('Verify authToken failed', error);
        await this.toastService.show('general.actions.verify.error');
      },
    });
  }

  preventBrowserSwipeBack(): void {
    window.addEventListener(
      'touchstart',
      function (event) {
        if (event.touches[0].pageX < 30) {
          event.preventDefault();
        }
      },
      { passive: false },
    );
  }
}
