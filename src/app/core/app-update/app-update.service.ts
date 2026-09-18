import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';
import { AlertController, type AlertOptions } from '@ionic/angular';
import { filter } from 'rxjs';

const ALERT_OPTIONS: AlertOptions = {
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

@Injectable({
  providedIn: 'root',
})
export class AppUpdateService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly swUpdate = inject(SwUpdate);
  private readonly alertController = inject(AlertController);

  watchForUpdates(): void {
    this.swUpdate.versionUpdates
      .pipe(
        filter((event) => event.type === 'VERSION_READY'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(async () => {
        const alert = await this.alertController.create(ALERT_OPTIONS);
        await alert.present();
      });
  }
}
