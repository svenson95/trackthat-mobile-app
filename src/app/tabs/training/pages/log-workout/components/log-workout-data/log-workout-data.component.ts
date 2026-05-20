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
} from '@ionic/angular/standalone';

import { LogsWorkoutService } from '../../../../services';

import type { WorkoutSet } from '../../../../../../shared/models';
import { HealthService, HelperService, UserService } from '../../../../../../shared/services';
import { ExerciseItemComponent } from '../../../workout/components';
import {
  LogWorkoutFormComponent,
  LogWorkoutSetListComponent,
  type ExerciseSetView,
  type ExerciseView,
  type LogWorkoutFormValue,
} from '../../components';

const ION_COMPONENTS = [IonItemDivider, IonItemGroup, IonList, IonItem, IonLabel];

@Component({
  selector: 'app-log-workout-data',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...ION_COMPONENTS,
    LogWorkoutFormComponent,
    LogWorkoutSetListComponent,
    ExerciseItemComponent,
    DatePipe,
  ],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-inline: 1rem;
      margin-top: 1rem;
      margin-bottom: 6rem;
    }

    .item-container {
      margin-top: 0.5rem;
      color: grey;
    }
  `,
  template: `
    <app-log-workout-form [isAddingSet]="isAddingSet()" (addSet)="addSet($event)" />

    @let latest = latestSet();
    @if (noSetsForThisExercise()) {
      <ion-item-group class="exercise-item">
        <ion-item-divider class="exercise-item is-selected-exercise">
          <app-exercise-item [exercise]="exercise()!" />
        </ion-item-divider>

        @if (latest) {
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
                  <h3>{{ latest.date * 1000 | date: 'dd.MM.yy' }}</h3>
                </ion-label>
              </ion-item>
            }
          </ion-list>
        }
      </ion-item-group>
    }

    <app-log-workout-set-list
      [skeletonSets]="skeletonSets"
      [exercises]="exercises()"
      [selectedExercise]="exercise()!"
      (setSelected)="setData($event)"
    />
  `,
})
export class LogWorkoutDataComponent {
  private readonly logsWorkoutService = inject(LogsWorkoutService);
  private readonly userService = inject(UserService);
  private readonly helperService = inject(HelperService);
  private readonly healthService = inject(HealthService);

  readonly logWorkoutForm = viewChild(LogWorkoutFormComponent);
  readonly latestSet = this.logsWorkoutService.latestSetResource.value;

  readonly itemId = input<string>();
  readonly exercise = input<string>();
  readonly logId = input<string>();

  readonly noSetsForThisExercise = computed<boolean>(() => {
    const log = this.logsWorkoutService.logWorkoutResource.value();
    if (!log) return true;
    const noSetForExerciseFound = !log.sets.some((l) => l.exercise === this.exercise());
    const notAdding = !this.isAddingSet();
    return noSetForExerciseFound && notAdding;
  });

  readonly skeletonSets = [1, 2, 3];
  readonly pendingSet = signal<{
    id: string;
    exercise: string;
    time: string;
  } | null>(null);
  readonly isAddingSet = computed(() => this.pendingSet() !== null);

  readonly exercises = computed<ExerciseView[]>(() => {
    const sets = this.logsWorkoutService.logWorkoutResource.value()?.sets ?? [];
    const exercises = this.groupSetsByExercise(sets).map<ExerciseView>(({ name, sets }) => ({
      name,
      sets: sets.map((set) => ({ type: 'set', set })),
    }));

    const pendingSet = this.pendingSet();
    if (!pendingSet) return exercises;

    const skeletonSet: ExerciseSetView = {
      type: 'skeleton',
      id: pendingSet.id,
      exercise: pendingSet.exercise,
      time: pendingSet.time,
    };

    const targetExercise = exercises.find(({ name }) => name === pendingSet.exercise);
    if (!targetExercise) {
      return [{ name: pendingSet.exercise, sets: [skeletonSet] }, ...exercises];
    }

    targetExercise.sets.push(skeletonSet);
    return exercises.sort((a, b) => this.getNewestExerciseTime(b) - this.getNewestExerciseTime(a));
  });

  addSet(formValue: LogWorkoutFormValue): void {
    if (this.isAddingSet()) {
      return;
    }

    const logId = this.logsWorkoutService.logId();
    const userId = this.userService.user().id;
    const exercise = this.exercise();

    if (!userId || !exercise) {
      console.error('Missing required data for addSet', {
        logId,
        userId,
        exercise,
      });
      return;
    }

    const set: WorkoutSet = {
      load: formValue.load,
      reps: formValue.reps,
      exercise,
      itemId: this.getNextItemId(),
      note: formValue.note,
      time: this.getCurrentTime(), // TODO: get time from form -> this.logWorkoutForm()!.form.value.time!
    };

    const pendingSetId = crypto.randomUUID();

    this.pendingSet.set({
      id: pendingSetId,
      exercise,
      time: this.getCurrentTime(),
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

  private getNewestExerciseTime(exercise: ExerciseView): number {
    const newestSet = exercise.sets[exercise.sets.length - 1];

    if (!newestSet) return 0;

    return newestSet.type === 'set'
      ? this.timeToSeconds(newestSet.set.time)
      : this.timeToSeconds(newestSet.time);
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
      const exercise = set.exercise;

      if (!acc[exercise]) acc[exercise] = [];
      acc[exercise].push(set);

      return acc;
    }, {});

    return Object.keys(grouped)
      .map((name) => {
        const exerciseSets = grouped[name].sort((a, b) => {
          return this.timeToSeconds(a.time) - this.timeToSeconds(b.time);
        });

        return {
          name,
          sets: exerciseSets,
        };
      })
      .sort((a, b) => {
        const newestASet = a.sets[a.sets.length - 1];
        const newestBSet = b.sets[b.sets.length - 1];

        const newestA = this.timeToSeconds(newestASet?.time);
        const newestB = this.timeToSeconds(newestBSet?.time);

        return newestB - newestA;
      });
  }

  private timeToSeconds(time: string | null | undefined): number {
    if (!time) return 0;

    const [hours = '0', minutes = '0', seconds = '0'] = time.split(':');

    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  }
}
