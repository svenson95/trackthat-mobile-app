import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastCtrl = inject(ToastController);
  private readonly translate = inject(TranslateService);

  async show(messageKey: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: this.translate.instant(messageKey),
      duration: 2500,
      color: 'warning',
      position: 'bottom',
    });
    await toast.present();
  }
}
