import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { IonModal } from '@ionic/angular/standalone';
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

import { WorkoutsTemplatesComponent } from '../components';

const ION_COMPONENTS = [
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
];

@Component({
  selector: 'app-add-workout-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, FormsModule, WorkoutsTemplatesComponent],
  styles: `
    h4 {
      margin-left: 1rem;
    }
  `,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="cancel()">Abbrechen</ion-button>
        </ion-buttons>
        <ion-title>Neuer Plan</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="confirm()" [strong]="true">Speichern</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-input
          label="Name"
          type="text"
          placeholder="Ganzkörper-Plan"
          [(ngModel)]="name"
        ></ion-input>
      </ion-item>

      <h4>Vorlagen</h4>
      <app-workouts-templates />
    </ion-content>
  `,
})
export class AddWorkoutDialog {
  modal = input.required<IonModal>();
  name = '';

  // TODO: add validation: not same name as other workouts, only specific letters and numbers

  cancel(): void {
    void this.modal().dismiss(null, 'cancel');
  }

  confirm(): void {
    void this.modal().dismiss(this.name, 'confirm');
  }
}
