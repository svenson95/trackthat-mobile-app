import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

const ION_COMPONENTS = [IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent];

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
        <app-log-workout-inputs />
      </app-content-container>
    </ion-content>
  `,
})
export class LogWorkoutPage implements OnInit {
  readonly workoutId = input<string | undefined>();
  readonly logId = input<string | undefined>();

  logsWorkoutService = inject(LogsWorkoutService);
  workoutsService = inject(WorkoutsService);

  router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  async ngOnInit(): Promise<void> {
    const logId =
      this.route.snapshot.paramMap.get('logId') ??
      this.route.parent?.snapshot.paramMap.get('logId');
    const id = Number(logId);
    if (!Number.isFinite(id)) return;

    this.logsWorkoutService.logId.set(id);
    await this.router.navigate(['log', id]);
  }

  backButtonText = computed(() => {
    const workout = this.workoutsService
      .sortedWorkouts()
      .find((w) => w.workoutId === Number(this.workoutId()));
    const name = workout?.name ?? '';
    return name.length > 12 ? `${name.slice(0, 10)}...` : name;
  });
}
