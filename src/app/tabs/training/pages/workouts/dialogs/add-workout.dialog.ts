import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonContent,
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

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import type { WorkoutDoc } from '../../../../../models';
import { WORKOUT_TEMPLATES } from '../../../../../shared';
import { WorkoutsService } from '../../../services';

const ION_COMPONENTS = [
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonContent,
  IonTitle,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonModal,
];

@Component({
  selector: 'app-add-workout-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, FormsModule, TranslateModule],
  styles: `
    h4 {
      margin-left: 1rem;
    }
  `,
  template: `
    <ion-modal (willDismiss)="onAddWorkoutSubmit($event)" #newWorkoutModal>
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button (click)="cancel()">{{ 'general.abort' | translate }}</ion-button>
            </ion-buttons>
            <ion-title>
              {{ 'tabs.training.workouts.actions.add-workout.title' | translate }}
            </ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="confirm()" [strong]="true" [disabled]="isLoading()">
                {{ 'general.save' | translate }}
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content [fullscreen]="true">
          <ion-item>
            <ion-input
              class="custom-input"
              id="name-input"
              label="Name"
              type="text"
              [placeholder]="
                'tabs.training.workouts.actions.add-workout.name-placeholder' | translate
              "
              [(ngModel)]="name"
              inputmode="text"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-select label="Vorlage" interface="popover" [(ngModel)]="templateId">
              <ion-select-option [value]="-1">
                {{
                  'tabs.training.workouts.actions.add-workout.template-dropdown.empty' | translate
                }}
              </ion-select-option>
              @for (template of templates; track template.workoutId) {
                <ion-select-option [value]="template.workoutId">{{
                  template.name
                }}</ion-select-option>
              }
            </ion-select>
          </ion-item>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
})
export class AddWorkoutDialog {
  private loadingCtrl = inject(LoadingController);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private translate = inject(TranslateService);
  modal = viewChild.required(IonModal);

  private workoutService = inject(WorkoutsService);

  name = '';
  templateId = -1;
  templates = WORKOUT_TEMPLATES;

  // TODO: add validation: not same name as other workouts, only specific letters and numbers
  isLoading = signal(false);

  cancel(): void {
    void this.modal().dismiss(null, 'cancel');
  }

  async confirm(): Promise<void> {
    if (this.name === '' || !this.name) return;

    const template = this.templates.find((t) => t.workoutId === this.templateId);
    const list = template ? template.list : [];
    const workoutData = this.workoutService.initWorkout(this.name, list);

    const loading = await this.loadingCtrl.create({
      // TODO: add translation german/english
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
      error: async (error) => {
        console.error('Error saving workout:', error);
        this.isLoading.set(false);
        void loading.dismiss();

        if (error.status === 409) {
          await this.toastCtrl
            .create({
              message: this.translate.instant('tabs.training.workouts.errors.already-exists'),
              duration: 2500,
              color: 'warning',
              position: 'bottom',
            })
            .then((toast) => toast.present());

          return;
        }

        await this.toastCtrl
          .create({
            message: this.translate.instant('general.unknown-error'),
            duration: 2500,
            color: 'warning',
            position: 'bottom',
          })
          .then((toast) => toast.present());
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
