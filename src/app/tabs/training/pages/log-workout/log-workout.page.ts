import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonPopover,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TranslateModule } from '@ngx-translate/core';

import { ContentContainerComponent } from '../../../../components';
import { IsEditingService, LogsWorkoutService, WorkoutsService } from '../../services';

import { LogWorkoutInputsComponent } from './components';

const ANGULAR_MODULES = [FormsModule];

const ION_COMPONENTS = [
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonIcon,
  IonButton,
  IonList,
  IonPopover,
  IonTitle,
  IonToolbar,
];

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
          @if (isEditing()) {
            <ion-button (click)="abortEditing()">
              {{ 'general.abort' | translate }}
            </ion-button>
          } @else {
            <ion-back-button
              [text]="backButtonText()"
              [defaultHref]="'/tabs/training/' + workoutId()"
            ></ion-back-button>
          }
        </ion-buttons>

        <ion-title>
          {{ 'tabs.training.log-workout.title' | translate }}
        </ion-title>

        <ion-buttons slot="primary">
          @if (isEditing()) {
            <ion-button>
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
          }
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
          [isEditing]="isEditing()"
        />
      </app-content-container>

      <ion-popover #moreMenu [isOpen]="isMoreMenuOpen()" (didDismiss)="isMoreMenuOpen.set(false)">
        <ng-template>
          <ion-list>
            <ion-item [button]="true" [detail]="false" (click)="startEditing()">
              {{ 'general.edit' | translate }}
            </ion-item>
          </ion-list>
        </ng-template>
      </ion-popover>
    </ion-content>
  `,
})
export class LogWorkoutPage {
  readonly workoutId = input<string | undefined>();
  readonly itemId = input<string | undefined>();
  readonly logId = input<string | undefined>();
  readonly exercise = input<string | undefined>();

  readonly logsWorkoutService = inject(LogsWorkoutService);
  readonly workoutsService = inject(WorkoutsService);

  private editService = inject(IsEditingService);
  isEditing = this.editService.isEditing;
  private moreMenu = viewChild.required<HTMLIonPopoverElement>('moreMenu');
  readonly isMoreMenuOpen = signal<boolean>(false);

  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    effect(() => {
      const logId = this.logsWorkoutService.logId();
      const workoutId = this.workoutId();
      if (!logId || !workoutId) return;

      const { itemId, exercise } = this.route.snapshot.params;
      const target = `/tabs/training/${workoutId}/${itemId}/${exercise}/log/${logId}`;
      if (this.location.path() === target) return;
      this.location.go(target);
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

  async startEditing(): Promise<void> {
    this.isEditing.set(true);
    await this.moreMenu().dismiss();
  }

  presentPopover(ev: Event): void {
    this.moreMenu().event = ev;
    this.isMoreMenuOpen.set(true);
  }

  async abortEditing(): Promise<void> {
    this.isEditing.set(false);
  }
}
