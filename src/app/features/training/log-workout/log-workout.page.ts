import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  LoadingController,
} from '@ionic/angular';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { IonicUiService } from '../../../shared';

import { WorkoutsService } from '../data-access';

import { LogWorkoutDataComponent } from './components';
import { LogWorkoutEditorState } from './log-workout-editor.state';
import { LogWorkoutService } from './log-workout.service';

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
  imports: [...ION_COMPONENTS, FormsModule, TranslateModule, LogWorkoutDataComponent],
  providers: [LogWorkoutEditorState],
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
            />
          }
        </ion-buttons>

        <ion-title>
          {{ 'tabs.training.log-workout.title' | translate }}
        </ion-title>

        <ion-buttons slot="primary">
          @if (isEditing()) {
            <ion-button (click)="saveEditing()">
              {{ 'general.save' | translate }}
            </ion-button>
          } @else {
            <ion-button (click)="presentPopover($event)">
              <ion-icon slot="icon-only" ios="ellipsis-horizontal" md="ellipsis-vertical" />
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

      <div class="page-content">
        <app-log-workout-data [exercise]="exercise()" />
      </div>

      <ion-popover #moreMenu [isOpen]="isMoreMenuOpen()" (didDismiss)="isMoreMenuOpen.set(false)">
        <ng-template>
          <ion-list lines="none">
            <ion-item button [detail]="false" (click)="startEditing()">
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

  private readonly logsWorkoutService = inject(LogWorkoutService);
  private readonly workoutsService = inject(WorkoutsService);
  private readonly ionicUiService = inject(IonicUiService);
  private readonly editorState = inject(LogWorkoutEditorState);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly location = inject(Location);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly translate = inject(TranslateService);

  private readonly moreMenu = viewChild.required<HTMLIonPopoverElement>('moreMenu');

  protected readonly isEditing = this.editorState.isEditing;
  protected readonly isMoreMenuOpen = signal(false);

  protected readonly backButtonText = computed(() => {
    const workout = this.workoutsService
      .sortedWorkouts()
      .find((currentWorkout) => currentWorkout.workoutId === Number(this.workoutId()));

    const name = workout?.name ?? '';

    return name.length > 12 ? `${name.slice(0, 10)}...` : name;
  });

  private readonly syncRouteWithLogData = effect(() => {
    const logId = this.logsWorkoutService.logId();
    const workoutId = this.workoutId();
    const itemId = this.itemId();
    const exercise = this.exercise();

    if (!workoutId || !itemId || !exercise) {
      return;
    }

    const baseTarget = `/tabs/training/${workoutId}/${itemId}/${exercise}/log`;

    const target = logId !== undefined ? `${baseTarget}/${logId}` : baseTarget;

    if (this.location.path() !== target) {
      this.location.replaceState(target);
    }
  });

  private readonly syncRouteWithService = effect(() => {
    const exercise = this.exercise();

    if (exercise) {
      this.logsWorkoutService.exercise.set(exercise);
    }
  });

  protected async startEditing(): Promise<void> {
    this.editorState.start();
    await this.moreMenu().dismiss();
  }

  protected presentPopover(event: Event): void {
    this.moreMenu().event = event;
    this.isMoreMenuOpen.set(true);
  }

  protected async abortEditing(): Promise<void> {
    await this.ionicUiService.closeSlidingItems(this.host);
    this.editorState.cancel();
  }

  protected async saveEditing(): Promise<void> {
    const deletedSets = this.editorState.deletedSets();
    const logId = this.logsWorkoutService.logId();

    if (deletedSets.length === 0) {
      this.editorState.finish();
      return;
    }

    if (logId === undefined) {
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('tabs.training.log-workout.actions.delete-set.process'),
      spinner: 'circles',
    });

    await loading.present();

    this.logsWorkoutService.deleteSets(String(logId), deletedSets).subscribe({
      next: async () => {
        await loading.dismiss();
        this.editorState.finish();
      },
      error: async (error) => {
        console.error('Could not save log workout changes', error);

        await loading.dismiss();

        await this.ionicUiService.showError('tabs.training.log-workout.actions.delete-set.error');
      },
    });
  }
}
