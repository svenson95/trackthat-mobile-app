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
} from '@ionic/angular/standalone';
import { finalize } from 'rxjs';

import type { WorkoutSet } from '../../../../../../shared/models';
import { HelperService, UserService } from '../../../../../../shared/services';

import { LogsWorkoutService } from '../../../../services';
import {
  LogWorkoutFormComponent,
  LogWorkoutSetListComponent,
  type ExerciseSetView,
  type ExerciseView,
  type LogWorkoutFormValue,
} from '../../components';

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
      gap: 0.5rem;
    }

    .sticky-form {
      position: sticky;
      top: 0.5rem;
      z-index: 100;

      width: 100%;
      padding-bottom: 0.5rem;

      background: var(--ion-color-base);

      isolation: isolate;
    }

    app-log-workout-set-list {
      position: relative;
      z-index: 0;
    }

    .item-container ion-label {
      color: grey;
    }
  `,
  template: `
    <div class="sticky-form">
      <app-log-workout-form [isAddingSet]="isAddingSet()" (addSet)="addSet($event)" />
    </div>

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
            @for (item of workout.sets; track item.itemId; let idx = $index; let isLast = $last) {
              <ion-item
                button
                [detail]="false"
                class="log-set ion-activatable"
                [lines]="isLast ? 'none' : 'inset'"
                (click)="setData(item)"
              >
                <ion-label>
                  <h3>#{{ idx + 1 }}</h3>
                  <h3>{{ item.reps }}x {{ item.load }} kg</h3>
                  <h3>{{ item.time.slice(0, 5) }}</h3>
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
  readonly itemId = input<string>();
  readonly exercise = input<string>();
  readonly logId = input<string>();

  private readonly logsWorkoutService = inject(LogsWorkoutService);
  private readonly userService = inject(UserService);
  private readonly helperService = inject(HelperService);

  readonly logWorkoutForm = viewChild.required(LogWorkoutFormComponent);

  readonly exerciseHistory = this.logsWorkoutService.exerciseHistoryResource.value;

  readonly isExerciseHistoryLoading = computed(() =>
    this.logsWorkoutService.exerciseHistoryResource.isLoading(),
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

  readonly exerciseView = computed<ExerciseView | undefined>(() => {
    const exercise = this.exercise();

    if (!exercise) {
      return undefined;
    }

    const sets = (this.logsWorkoutService.logWorkoutResource.value()?.sets ?? [])
      .filter((set) => set.exercise === exercise)
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

    const request = this.logsWorkoutService.loadMoreExerciseHistory();

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

          await this.helperService.showError('tabs.training.log-workout.actions.get-error');
        },
      });
  }

  addSet(formValue: LogWorkoutFormValue): void {
    if (this.isAddingSet()) {
      return;
    }

    const logId = this.logsWorkoutService.logId();
    const userId = this.userService.userData()?.id;
    const exercise = this.exercise();

    if (!userId || !exercise) {
      console.error('Missing required data for addSet', {
        logId,
        userId,
        exercise,
      });

      return;
    }

    const time = this.logWorkoutForm().timeManuallyChanged()
      ? this.logWorkoutForm().formValueTime()
      : this.getCurrentTime();

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
      this.logsWorkoutService.addLogWorkout(formValue.date, set, userId).subscribe({
        next: () => {
          this.pendingSet.set(null);
        },
        error: async (error) => {
          this.pendingSet.set(null);

          console.error('Could not add workout set', error);

          await this.helperService.showError('tabs.training.log-workout.actions.add-set.error');
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
    const sets = this.logsWorkoutService.logWorkoutResource.value()?.sets ?? [];

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
