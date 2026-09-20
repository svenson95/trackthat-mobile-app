import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  LoadingController,
} from '@ionic/angular';
import type { OverlayEventDetail } from '@ionic/core';
import { firstValueFrom } from 'rxjs';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import type { Workout, WorkoutDoc } from '../../../../../../core';
import { IonicUiService } from '../../../../../../shared';

import { WorkoutsService } from '../../../../data-access';
import { WORKOUT_NAME_MAX_LENGTH } from '../../../../utils';

import { WORKOUT_TEMPLATES } from './workout-templates.data';

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
  selector: 'app-add-workout-modal',
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
                [disabled]="isLoading() || !hasValidName"
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
              label="Name"
              type="text"
              [maxlength]="INPUT_MAX_LENGTH"
              [counter]="true"
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
export class AddWorkoutModalComponent {
  private readonly loadingCtrl = inject(LoadingController);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly workoutsService = inject(WorkoutsService);
  private readonly ionicUiService = inject(IonicUiService);

  private readonly modal = viewChild.required(IonModal);

  protected readonly INPUT_MAX_LENGTH = WORKOUT_NAME_MAX_LENGTH;
  protected readonly templates = WORKOUT_TEMPLATES;
  protected readonly EMPTY_TEMPLATE_ID = -1;
  protected readonly isLoading = signal(false);

  protected templateId = this.EMPTY_TEMPLATE_ID;
  protected name = '';

  protected get hasValidName(): boolean {
    const name = this.name.trim();

    return name.length > 0 && name.length <= this.INPUT_MAX_LENGTH;
  }

  public async present(): Promise<void> {
    await this.modal().present();
  }

  protected async cancel(): Promise<void> {
    await this.modal().dismiss(null, 'cancel');
  }

  protected async confirm(): Promise<void> {
    if (!this.hasValidName || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    let loading: HTMLIonLoadingElement | undefined;
    let savedWorkout: WorkoutDoc | undefined;

    try {
      loading = await this.loadingCtrl.create({
        message: this.translate.instant('tabs.training.workouts.actions.add-workout.process'),
        spinner: 'circles',
      });

      await loading.present();

      const workout = this.createWorkout(this.name.trim());

      savedWorkout = await firstValueFrom(this.workoutsService.addWorkout(workout));
    } catch (error: unknown) {
      console.error('Error saving workout:', error);

      if (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        error.status === 409
      ) {
        await this.ionicUiService.showError(
          'tabs.training.workouts.actions.add-workout.already-exists',
        );
      } else {
        await this.ionicUiService.showError('general.unknown-error');
      }
    } finally {
      await loading?.dismiss();
      this.isLoading.set(false);
    }

    if (savedWorkout) {
      await this.modal().dismiss(savedWorkout, 'confirm');
    }
  }

  protected onModalDismiss(event: CustomEvent<OverlayEventDetail<WorkoutDoc>>): void {
    const { data: workout, role } = event.detail;

    if (role !== 'confirm' || !workout) {
      return;
    }

    void this.router.navigate(['tabs', 'training', workout.workoutId]);
  }

  private createWorkout(name: string): Workout {
    const template = this.templates.find(({ workoutId }) => workoutId === this.templateId);
    const list = template?.list ?? [];

    return this.workoutsService.initWorkout(name, list);
  }
}
