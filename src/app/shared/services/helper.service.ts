import type { ElementRef } from '@angular/core';
import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  private readonly toastCtrl = inject(ToastController);
  private readonly translate = inject(TranslateService);

  async showError(messageKey: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: this.translate.instant(messageKey),
      duration: 2500,
      color: 'warning',
      position: 'bottom',
    });
    await toast.present();
  }

  async closeSlidingItems(host: ElementRef<HTMLElement>): Promise<void> {
    const slidingItems = Array.from(
      host.nativeElement.querySelectorAll('ion-item-sliding'),
    ) as HTMLIonItemSlidingElement[];
    await Promise.all(slidingItems.map((item) => item.close()));
  }
}
