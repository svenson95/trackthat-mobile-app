import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
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
import { WorkoutsService } from '../services';

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
          <ion-button (click)="confirm()" [strong]="true" [disabled]="isLoading()">
            Speichern
          </ion-button>
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
  private workoutService = inject(WorkoutsService);
  private loadingCtrl = inject(LoadingController);
  modal = input.required<IonModal>();
  name = '';

  // TODO: add validation: not same name as other workouts, only specific letters and numbers
  isLoading = signal(false);

  cancel(): void {
    void this.modal().dismiss(null, 'cancel');
  }

  async confirm(): Promise<void> {
    if (this.name === '' || !this.name) return;
    const workoutData = this.workoutService.initWorkout(this.name);
    const loading = await this.loadingCtrl.create({
      message: 'Trainingsplan wird erstellt ...',
      spinner: 'circles',
    });
    void loading.present();
    this.isLoading.set(true);

    this.workoutService.addWorkout(workoutData).subscribe({
      next: (response) => {
        void loading.dismiss();
        this.isLoading.set(false);
        void this.modal().dismiss(response, 'confirm');
      },
      error: (error) => {
        void loading.dismiss();
        this.isLoading.set(false);
        void this.modal().dismiss(null, 'cancel');
        console.error('Error saving workout:', error);
      },
    });
  }
}
