import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TranslateModule } from '@ngx-translate/core';

import { ContentContainerComponent } from '../../../../components';
import { LogsWorkoutService, WorkoutsService } from '../../services';

import { LogWorkoutInputsComponent } from './components';

const ANGULAR_MODULES = [FormsModule];

const ION_COMPONENTS = [IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar];

@Component({
  selector: 'app-log-workout-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...ANGULAR_MODULES,
    ...ION_COMPONENTS,
    TranslateModule,
    ContentContainerComponent,
    LogWorkoutInputsComponent,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <!-- @if (isEditing()) {
            <ion-button (click)="abortEditing(workoutComp.workoutList())">
              {{ 'general.abort' | translate }}
            </ion-button>
          } @else { -->
          <ion-back-button
            [text]="backButtonText()"
            [defaultHref]="'/tabs/training/' + workoutId()"
          ></ion-back-button>
          <!-- } -->
        </ion-buttons>

        <ion-title>
          {{ 'tabs.training.log-workout.title' | translate }}
        </ion-title>

        <ion-buttons slot="primary">
          <!-- @if (isEditing()) {
            <ion-button (click)="saveEdit('general.actions.save-list')">
              {{ 'general.save' | translate }}
            </ion-button>
          } @else {
            <ion-button (click)="presentPopover($event)">
              <ion-icon
                slot="icon-only"
                ios="ellipsis-horizontal"
                md="ellipsis-vertical"
              ></ion-icon>
            </ion-button>
          } -->
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" color="light">
      <ion-header collapse="condense">
        <ion-toolbar color="light">
          <ion-title size="large">
            {{ 'tabs.training.log-workout.title' | translate }}
          </ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container>
        <app-log-workout-inputs
          [isLoading]="isLoading()"
          [exercise]="exercise()"
          [itemId]="itemId()"
        />
      </app-content-container>
    </ion-content>
  `,
})
export class LogWorkoutPage {
  readonly workoutId = input<string | undefined>();
  readonly itemId = input<string | undefined>();
  readonly exercise = input<string | undefined>();

  readonly logsWorkoutService = inject(LogsWorkoutService);
  readonly workoutsService = inject(WorkoutsService);

  constructor() {
    effect(() => {
      const id = Number(this.itemId());
      if (!Number.isFinite(id)) return;
      this.logsWorkoutService.logId.set(id);
    });
  }

  readonly isLoading = computed(() => {
    return this.logsWorkoutService.logWorkoutResource.isLoading();
  });

  readonly backButtonText = computed(() => {
    const workout = this.workoutsService
      .sortedWorkouts()
      .find((w) => w.workoutId === Number(this.workoutId()));
    const name = workout?.name ?? '';
    return name.length > 12 ? `${name.slice(0, 10)}...` : name;
  });
}
