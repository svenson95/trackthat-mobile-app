import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { VersionEvent } from '@angular/service-worker';
import { SwUpdate } from '@angular/service-worker';
import { AlertController, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  imports: [IonicModule],
})
export class AppComponent {
  swUpdate = inject(SwUpdate);
  alertCtrl = inject(AlertController);

  constructor() {
    this.checkVersionOnStart();
  }

  private checkVersionOnStart(): void {
    this.swUpdate.versionUpdates.subscribe(async (event: VersionEvent) => {
      if (event.type === 'VERSION_READY') {
        const alert = await this.alertCtrl.create(this.alertOptions);
        await alert.present();
      }
    });
  }

  private alertOptions = {
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
}
