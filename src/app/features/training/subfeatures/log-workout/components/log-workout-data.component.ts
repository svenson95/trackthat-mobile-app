import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  IonButton,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonSkeletonText,
  IonSpinner,
} from '@ionic/angular';
import { finalize } from 'rxjs';

import type { WorkoutSet } from '../../../../../core';
import { UserService } from '../../../../../core';
import { IonicUiService } from '../../../../../shared';

import { LogWorkoutEditorState } from '../log-workout-editor.state';
import { LogWorkoutService } from '../log-workout.service';

import type { LogWorkoutFormValue } from './log-workout-form.component';
import { LogWorkoutFormComponent } from './log-workout-form.component';
import type { ExerciseSetView, ExerciseView } from './log-workout-set-list.component';
import { LogWorkoutSetListComponent } from './log-workout-set-list.component';

const ION_COMPONENTS = [
  IonButton,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonSkeletonText,
  IonSpinner,
];

@Component({
  selector: 'app-log-workout-data',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, LogWorkoutFormComponent, LogWorkoutSetListComponent, DatePipe],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-inline: 1rem;
      margin-top: 1rem;
      margin-bottom: 6rem;
      gap: 1rem;
    }

    ion-item-group.exercise-item ion-item-divider {
      border-top-left-radius: var(--app-radius-1);
      border-top-right-radius: var(--app-radius-1);
    }

    app-log-workout-form {
      display: block;
      width: 100%;
    }

    .item-container ion-label {
      color: grey;
    }
  `,
  template: `
    <app-log-workout-form [isAddingSet]="isAddingSet()" (addSet)="addSet($event)" />

    @if (exerciseView(); as exerciseView) {
      <app-log-workout-set-list
        [skeletonSets]="skeletonSets"
        [exercise]="exerciseView"
        (setSelected)="setData($event)"
      />
    }

    @if (isExerciseHistoryLoading()) {
      @for (historySkeleton of [1, 2]; track historySkeleton) {
        <ion-item-group class="exercise-item">
          <ion-item-divider>
            <ion-label>
              <ion-skeleton-text animated style="width: 7rem" />
            </ion-label>
          </ion-item-divider>

          <div class="item-container">
            @for (item of skeletonSets; track item) {
              <ion-item class="log-set skeleton-log-set" lines="none">
                <ion-label>
                  <ion-skeleton-text animated class="set-index-skeleton" />
                  <ion-skeleton-text animated class="set-value-skeleton" />
                  <ion-skeleton-text animated class="set-time-skeleton" />
                </ion-label>
              </ion-item>
            }
          </div>
        </ion-item-group>
      }
    } @else if (exerciseHistory(); as history) {
      @for (workout of history.workouts; track workout.logId) {
        <ion-item-group class="exercise-item">
          <ion-item-divider>
            <ion-label>
              {{ workout.date * 1000 | date: 'dd.MM.yy' }}
            </ion-label>
          </ion-item-divider>

          <ion-list class="item-container">
            @for (set of workout.sets; track set.itemId; let idx = $index; let isLast = $last) {
              <ion-item
                button
                [detail]="false"
                class="log-set ion-activatable"
                [lines]="isLast ? 'none' : 'inset'"
                (click)="setData(set)"
              >
                <ion-label>
                  <h3>#{{ idx + 1 }}</h3>
                  <h3 class="set-values">
                    <span>{{ set.reps }} x</span>
                    <span>{{ set.load }} kg</span>
                  </h3>
                  <h3 class="set-note">{{ set.note }}</h3>
                  <h3>{{ set.time.slice(0, 5) }}</h3>
                </ion-label>
              </ion-item>
            }
          </ion-list>
        </ion-item-group>
      }

      @if (history.hasMore) {
        <ion-button fill="clear" [disabled]="isLoadingMoreHistory()" (click)="loadMoreHistory()">
          @if (isLoadingMoreHistory()) {
            <ion-spinner name="crescent" />
          } @else {
            Weitere laden
          }
        </ion-button>
      }
    }
  `,
})
export class LogWorkoutDataComponent {
  readonly exercise = input<string>();

  private readonly logWorkoutService = inject(LogWorkoutService);
  private readonly userService = inject(UserService);
  private readonly ionicUiService = inject(IonicUiService);

  readonly logWorkoutForm = viewChild(LogWorkoutFormComponent);

  readonly exerciseHistory = this.logWorkoutService.exerciseHistoryResource.value;

  readonly isExerciseHistoryLoading = computed(() =>
    this.logWorkoutService.exerciseHistoryResource.isLoading(),
  );

  readonly isLoadingMoreHistory = signal(false);

  readonly canLoadMoreHistory = computed(
    () => !this.isLoadingMoreHistory() && (this.exerciseHistory()?.hasMore ?? false),
  );

  readonly skeletonSets = [1, 2];

  readonly pendingSet = signal<{
    id: string;
    exercise: string;
    time: string;
  } | null>(null);

  readonly isAddingSet = computed<boolean>(() => this.pendingSet() !== null);

  private readonly editorState = inject(LogWorkoutEditorState);

  protected readonly exerciseView = computed<ExerciseView | undefined>(() => {
    const exercise = this.exercise();

    if (!exercise) {
      return undefined;
    }

    const deletedItemIds = this.editorState.deletedItemIds();

    const sets = (this.logWorkoutService.logWorkoutResource.value()?.sets ?? [])
      .filter((set) => set.exercise === exercise && !deletedItemIds.has(set.itemId))
      .sort((a, b) => this.timeToSeconds(a.time) - this.timeToSeconds(b.time))
      .map<ExerciseSetView>((set) => ({
        type: 'set',
        set,
      }));

    const pendingSet = this.pendingSet();

    if (pendingSet?.exercise === exercise) {
      sets.push({
        type: 'skeleton',
        id: pendingSet.id,
        exercise: pendingSet.exercise,
        time: pendingSet.time,
      });

      return {
        name: exercise,
        sets,
      };
    }

    const form = this.logWorkoutForm();

    if (form) {
      sets.push({
        type: 'placeholder',
        load: form.formValueLoad(),
        reps: form.formValueReps(),
        note: form.formValueNote(),
        time: form.formValueTime(),
      });
    }

    return {
      name: exercise,
      sets,
    };
  });

  loadMoreHistory(): void {
    if (!this.canLoadMoreHistory()) {
      return;
    }

    const request = this.logWorkoutService.loadMoreExerciseHistory();

    if (!request) {
      return;
    }

    this.isLoadingMoreHistory.set(true);

    request
      .pipe(
        finalize(() => {
          this.isLoadingMoreHistory.set(false);
        }),
      )
      .subscribe({
        error: async (error) => {
          console.error('Could not load exercise history', error);

          await this.ionicUiService.showError('tabs.training.log-workout.actions.get-error');
        },
      });
  }

  addSet(formValue: LogWorkoutFormValue): void {
    if (this.isAddingSet()) {
      return;
    }

    const logId = this.logWorkoutService.logId();
    const userId = this.userService.userData()?.id;
    const exercise = this.exercise();
    const form = this.logWorkoutForm();

    if (!userId || !exercise || !form) {
      console.error('Missing required data for addSet', {
        logId,
        userId,
        exercise,
        hasForm: !!form,
      });

      return;
    }

    const time = form.timeManuallyChanged() ? form.formValueTime() : this.getCurrentTime();

    const set: WorkoutSet = {
      load: formValue.load,
      reps: formValue.reps,
      exercise,
      itemId: this.getNextItemId(),
      note: formValue.note,
      time,
    };

    const pendingSetId = crypto.randomUUID();

    this.pendingSet.set({
      id: pendingSetId,
      exercise,
      time,
    });

    requestAnimationFrame(() => {
      this.logWorkoutService.addLogWorkout(formValue.date, set, userId).subscribe({
        next: () => {
          this.pendingSet.set(null);
        },
        error: async (error) => {
          this.pendingSet.set(null);

          console.error('Could not add workout set', error);

          await this.ionicUiService.showError('tabs.training.log-workout.actions.add-set.error');
        },
      });
    });
  }

  setData(set: WorkoutSet): void {
    this.logWorkoutForm()?.patchForm({
      load: set.load,
      reps: set.reps,
      note: set.note,
    });
  }

  private getCurrentTime(): string {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }

  private getNextItemId(): number {
    const sets = this.logWorkoutService.logWorkoutResource.value()?.sets ?? [];

    const maxItemId = sets.reduce((max, set) => {
      return Math.max(max, set.itemId);
    }, -1);

    return maxItemId + 1;
  }

  private timeToSeconds(time: string | null | undefined): number {
    if (!time) {
      return 0;
    }

    const [hours = '0', minutes = '0', seconds = '0'] = time.split(':');

    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  }
}
