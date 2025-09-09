import { inject, Injectable } from '@angular/core';
import type { VersionEvent } from '@angular/service-worker';
import { SwUpdate } from '@angular/service-worker';
import { AlertController } from '@ionic/angular';

import { AuthService } from './auth/auth.service';

@Injectable()
export class AppService {
  private swUpdate = inject(SwUpdate);
  private alertCtrl = inject(AlertController);
  private authService = inject(AuthService);

  private ALERT_OPTIONS = {
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

  getVersionUpdates(): void {
    this.swUpdate.versionUpdates.subscribe(async (event: VersionEvent) => {
      if (event.type === 'VERSION_READY') {
        const alert = await this.alertCtrl.create(this.ALERT_OPTIONS);
        await alert.present();
      }
    });
  }

  updateUserData(): void {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    this.authService.verify(token).subscribe({
      next: (res) => {
        this.authService.setUserData(res.user);
        this.authService.setToken(res.token);
      },
      error: () => console.error('Verify authToken failed'),
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
