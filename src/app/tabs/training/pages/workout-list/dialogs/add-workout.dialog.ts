import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonInput,
  IonItem,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import type { OverlayEventDetail } from '@ionic/core';

import type { WorkoutDoc } from '../../../../../models';

import { WorkoutsService } from '../../../services';
import { WORKOUTS_TEMPLATES } from '../components';

const ION_COMPONENTS = [
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonModal,
];

@Component({
  selector: 'app-add-workout-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, FormsModule],
  styles: `
    h4 {
      margin-left: 1rem;
    }
  `,
  template: `
    <ion-modal
      trigger="add-workout-modal"
      (willDismiss)="onAddWorkoutSubmit($event)"
      #newWorkoutModal
    >
      <ng-template>
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

        <ion-item>
          <ion-input
            id="name-input"
            label="Name"
            type="text"
            placeholder="Ganzkörper-Plan"
            [(ngModel)]="name"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-select label="Vorlage" interface="popover" [(ngModel)]="templateId">
            <ion-select-option [value]="-1">Keine</ion-select-option>
            @for (template of templates; track template.workoutId) {
              <ion-select-option [value]="template.workoutId">{{
                template.name
              }}</ion-select-option>
            }
          </ion-select>
        </ion-item>
      </ng-template>
    </ion-modal>
  `,
})
export class AddWorkoutDialog {
  private workoutService = inject(WorkoutsService);
  private loadingCtrl = inject(LoadingController);
  private router = inject(Router);
  modal = viewChild.required(IonModal);
  name = '';
  templateId = -1;
  templates = WORKOUTS_TEMPLATES;

  // TODO: add validation: not same name as other workouts, only specific letters and numbers
  isLoading = signal(false);

  cancel(): void {
    void this.modal().dismiss(null, 'cancel');
  }

  async confirm(): Promise<void> {
    if (this.name === '' || !this.name) return;

    const template = this.templates.find((t) => t.workoutId === this.templateId);
    const units = template ? template.units : [];
    const workoutData = this.workoutService.initWorkout(this.name, units);

    const loading = await this.loadingCtrl.create({
      message: 'Trainingsplan wird erstellt ...',
      spinner: 'circles',
    });
    this.isLoading.set(true);
    void loading.present();

    this.workoutService.addWorkout(workoutData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        void loading.dismiss();
        void this.modal().dismiss(response, 'confirm');
      },
      error: (error) => {
        this.isLoading.set(false);
        void loading.dismiss();
        void this.modal().dismiss(null, 'cancel');
        console.error('Error saving workout:', error);
      },
    });
  }

  onAddWorkoutSubmit(event: CustomEvent<OverlayEventDetail<WorkoutDoc>>): void {
    const { data } = event.detail;
    if (!data) return;

    const workoutId = data.workoutId;
    void this.router.navigate(['tabs', 'training', workoutId]);
  }
}
