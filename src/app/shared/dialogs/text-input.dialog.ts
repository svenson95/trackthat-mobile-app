// text-input-modal.component.ts
import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { Capacitor } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { TranslateModule } from '@ngx-translate/core';

const ION_COMPONENTS = [IonButton, IonContent, IonHeader, IonInput, IonItem, IonTitle, IonToolbar];

@Component({
  selector: 'app-text-input-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, FormsModule, TranslateModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-input
          [label]="label"
          label-placement="floating"
          [(ngModel)]="value"
          [placeholder]="placeholder"
        />
      </ion-item>

      <div class="actions">
        <ion-button fill="clear" color="medium" (click)="close()">
          {{ 'general.abort' | translate }}
        </ion-button>

        <ion-button [disabled]="value.trim() === initialValue" (click)="save()">
          {{ 'general.save' | translate }}
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 24px;
      }
    `,
  ],
})
export class TextInputDialogComponent implements OnInit {
  @Input({ required: true }) title = '';
  @Input({ required: true }) label = '';
  @Input({ required: true }) placeholder = '';
  @Input({ required: true }) value = '';

  private modalCtrl = inject(ModalController);

  initialValue = '';

  async ngOnInit(): Promise<void> {
    this.initialValue = this.value.trim();

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    await Keyboard.setResizeMode({
      mode: KeyboardResize.Body,
    });

    await Keyboard.addListener('keyboardWillShow', () => {
      const active = document.activeElement as HTMLElement;

      setTimeout(() => {
        active?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 250);
    });
  }

  async close(): Promise<void> {
    await this.modalCtrl.dismiss();
  }

  async save(): Promise<void> {
    await this.modalCtrl.dismiss(this.value.trim());
  }
}
