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
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonSkeletonText,
} from '@ionic/angular/standalone';

import type { WorkoutSet } from '../../../../../../shared/models';
import { HealthService, HelperService, UserService } from '../../../../../../shared/services';

import { LogsWorkoutService } from '../../../../services';
import {
  LogWorkoutFormComponent,
  LogWorkoutSetListComponent,
  type ExerciseSetView,
  type ExerciseView,
  type LogWorkoutFormValue,
} from '../../components';

const ION_COMPONENTS = [IonItemDivider, IonItemGroup, IonList, IonItem, IonLabel, IonSkeletonText];

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

    <app-log-workout-set-list
      [skeletonSets]="skeletonSets"
      [exercises]="exercises()"
      [selectedExercise]="exercise()!"
      (setSelected)="setData($event)"
    />

    @let latest = latestSet();

    @if (isLatestSetLoading()) {
      <ion-item-group class="exercise-item">
        <ion-item-divider>
          <ion-label>Letztes Training</ion-label>
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
    } @else if (latest && latest.sets.length > 0) {
      <ion-item-group class="exercise-item">
        <ion-item-divider>
          <ion-label>Letztes Training</ion-label>
        </ion-item-divider>

        <ion-list class="item-container">
          @for (item of latest.sets; track item.itemId; let idx = $index; let isLast = $last) {
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
                <h3>
                  {{ latest.date * 1000 | date: 'dd.MM.yy' }}
                </h3>
              </ion-label>
            </ion-item>
          }
        </ion-list>
      </ion-item-group>
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
  private readonly healthService = inject(HealthService);

  readonly logWorkoutForm = viewChild.required(LogWorkoutFormComponent);

  readonly latestSet = this.logsWorkoutService.latestSetResource.value;

  readonly skeletonSets = [1, 2];

  readonly pendingSet = signal<{
    id: string;
    exercise: string;
    time: string;
  } | null>(null);

  readonly isAddingSet = computed<boolean>(() => this.pendingSet() !== null);

  readonly isLatestSetLoading = computed<boolean>(() =>
    this.logsWorkoutService.latestSetResource.isLoading(),
  );

  readonly exercises = computed<ExerciseView[]>(() => {
    const sets = this.logsWorkoutService.logWorkoutResource.value()?.sets ?? [];

    const exercises = this.groupSetsByExercise(sets).map<ExerciseView>(({ name, sets }) => ({
      name,
      sets: sets.map((set) => ({
        type: 'set',
        set,
      })),
    }));

    const pendingSet = this.pendingSet();

    if (!pendingSet) {
      return exercises;
    }

    const skeletonSet: ExerciseSetView = {
      type: 'skeleton',
      id: pendingSet.id,
      exercise: pendingSet.exercise,
      time: pendingSet.time,
    };

    const targetExercise = exercises.find(({ name }) => name === pendingSet.exercise);

    if (!targetExercise) {
      return [
        ...exercises,
        {
          name: pendingSet.exercise,
          sets: [skeletonSet],
        },
      ];
    }

    targetExercise.sets.push(skeletonSet);

    return exercises;
  });

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
          this.healthService.scheduleDelayedPing();
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

  private groupSetsByExercise(sets: WorkoutSet[]): { name: string; sets: WorkoutSet[] }[] {
    const grouped = sets.reduce<Record<string, WorkoutSet[]>>((acc, set) => {
      if (!acc[set.exercise]) {
        acc[set.exercise] = [];
      }

      acc[set.exercise].push(set);

      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, exerciseSets]) => ({
        name,
        sets: exerciseSets.sort((a, b) => this.timeToSeconds(a.time) - this.timeToSeconds(b.time)),
      }))
      .sort((a, b) => {
        const firstA = a.sets[0];
        const firstB = b.sets[0];

        return this.timeToSeconds(firstA?.time) - this.timeToSeconds(firstB?.time);
      });
  }

  private timeToSeconds(time: string | null | undefined): number {
    if (!time) {
      return 0;
    }

    const [hours = '0', minutes = '0', seconds = '0'] = time.split(':');

    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  }
}
