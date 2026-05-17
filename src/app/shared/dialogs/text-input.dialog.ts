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
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="close()">{{ 'general.abort' | translate }}</ion-button>
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="save()" [strong]="true" [disabled]="value.trim() === initialValue">
            {{ 'general.save' | translate }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-input
          type="text"
          [(ngModel)]="value"
          [placeholder]="placeholder"
          [label]="label"
          labelPlacement="stacked"
        ></ion-input>
      </ion-item>
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
export class TextInputDialog implements OnInit {
  @Input() title = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() value = '';

  initialValue = '';

  private modalCtrl = inject(ModalController);

  async ngOnInit(): Promise<void> {
    this.initialValue = this.value.trim();
  }

  async close(): Promise<void> {
    await this.modalCtrl.dismiss();
  }

  async save(): Promise<void> {
    await this.modalCtrl.dismiss(this.value.trim());
  }
}
