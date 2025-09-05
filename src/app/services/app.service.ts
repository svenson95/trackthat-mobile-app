import { inject, Injectable } from '@angular/core';
import type { VersionEvent } from '@angular/service-worker';
import { SwUpdate } from '@angular/service-worker';
import { AlertController } from '@ionic/angular';

import { AuthService } from './auth.service';

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
    const token = localStorage.getItem('authToken')!;
    this.authService.verify(token).subscribe({
      next: (res) => {
        this.authService.user.set(res.user);
        localStorage.setItem('authToken', res.token);
      },
      error: () => console.error('Verify authToken failed'),
    });
  }
}
