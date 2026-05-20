import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
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

import {
  HelperService,
  WORKOUT_TEMPLATES,
  type Workout,
  type WorkoutDoc,
} from '../../../../../shared';
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

    ion-content {
      --padding-start: 1rem;
      --padding-end: 1rem;
      --padding-top: 1rem;
      --padding-bottom: 1rem;
    }
  `,
  template: `
    <ion-modal (willDismiss)="onModalDismiss($event)" #newWorkoutModal>
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button (click)="cancel()">
                {{ 'general.abort' | translate }}
              </ion-button>
            </ion-buttons>

            <ion-title>
              {{ 'tabs.training.workouts.actions.add-workout.title' | translate }}
            </ion-title>

            <ion-buttons slot="end">
              <ion-button
                (click)="confirm()"
                [strong]="true"
                [disabled]="isLoading() || !hasValidName()"
              >
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
            />
          </ion-item>

          <ion-item lines="none">
            <ion-select label="Vorlage" interface="popover" [(ngModel)]="templateId">
              <ion-select-option [value]="EMPTY_TEMPLATE_ID">
                {{
                  'tabs.training.workouts.actions.add-workout.template-dropdown.empty' | translate
                }}
              </ion-select-option>

              @for (template of templates; track template.workoutId) {
                <ion-select-option [value]="template.workoutId">
                  {{ template.name }}
                </ion-select-option>
              }
            </ion-select>
          </ion-item>
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
})
export class AddWorkoutDialog {
  private readonly router = inject(Router);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly translate = inject(TranslateService);

  readonly modal = viewChild.required(IonModal);

  private readonly workoutsService = inject(WorkoutsService);
  private readonly helperService = inject(HelperService);

  readonly templates = WORKOUT_TEMPLATES;
  readonly EMPTY_TEMPLATE_ID = -1;
  readonly isLoading = signal<boolean>(false);

  readonly templateId = this.EMPTY_TEMPLATE_ID;

  name = '';

  async cancel(): Promise<void> {
    await this.modal().dismiss(null, 'cancel');
  }

  async confirm(): Promise<void> {
    if (!this.hasValidName()) {
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('tabs.training.workouts.actions.add-workout.process'),
      spinner: 'circles',
    });
    this.isLoading.set(true);
    await loading.present();

    this.workoutsService.addWorkout(this.createWorkout()).subscribe({
      next: async (workout) => {
        await loading.dismiss();
        this.isLoading.set(false);

        await this.modal().dismiss(workout, 'confirm');
      },
      error: async (error: unknown) => {
        console.error('Error saving workout:', error);
        await loading.dismiss();
        this.isLoading.set(false);

        if (
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          error.status === 409
        ) {
          await this.helperService.showError(
            'tabs.training.workouts.actions.add-workout.already-exists',
          );
          return;
        }

        await this.helperService.showError('general.unknown-error');
      },
    });
  }

  onModalDismiss(event: CustomEvent<OverlayEventDetail<WorkoutDoc>>): void {
    const workout = event.detail.data;
    if (!workout) return;
    void this.router.navigate(['tabs', 'training', workout.workoutId]);
  }

  hasValidName(): boolean {
    return this.name.trim().length > 0;
  }

  private createWorkout(): Workout {
    const template = this.templates.find(({ workoutId }) => workoutId === this.templateId);
    const list = template?.list ?? [];
    return this.workoutsService.initWorkout(this.name.trim(), list);
  }
}
