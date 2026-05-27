import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TranslateModule } from '@ngx-translate/core';

const ION_COMPONENTS = [
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonTitle,
  IonToolbar,
];

@Component({
  selector: 'app-text-input-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, FormsModule, TranslateModule],
  styles: `
    ion-content {
      --padding-start: 1rem;
      --padding-end: 1rem;
      --padding-top: 1rem;
      --padding-bottom: 1rem;
    }
  `,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="close()">{{ 'general.abort' | translate }}</ion-button>
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="save()" [strong]="true" [disabled]="isValueInvalid">
            {{ 'general.save' | translate }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item lines="none">
        <ion-input
          class="custom-input"
          type="text"
          [maxlength]="maxLength ?? null"
          [counter]="!!maxLength"
          [(ngModel)]="value"
          [placeholder]="placeholder"
          [label]="label"
          labelPlacement="stacked"
          inputmode="text"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        ></ion-input>
      </ion-item>
    </ion-content>
  `,
})
export class TextInputDialog implements OnInit {
  @Input() title = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() maxLength?: number;

  initialValue = '';

  private modalCtrl = inject(ModalController);

  get isValueTooLong(): boolean {
    return !!this.maxLength && this.value.trim().length > this.maxLength;
  }

  get isValueInvalid(): boolean {
    return this.value.trim() === this.initialValue || this.isValueTooLong;
  }

  async ngOnInit(): Promise<void> {
    this.initialValue = this.value.trim();
  }

  async close(): Promise<void> {
    await this.modalCtrl.dismiss();
  }

  async save(): Promise<void> {
    const trimmedValue = this.value.trim();
    if (this.maxLength && trimmedValue.length > this.maxLength) {
      return;
    }

    await this.modalCtrl.dismiss(trimmedValue);
  }
}
