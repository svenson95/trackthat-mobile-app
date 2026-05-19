import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import type { WorkoutSet } from '../../../../../models';
import { UserService } from '../../../../../services';
import { LogsWorkoutService } from '../../../services';

import type { LogWorkoutFormValue } from './log-workout-form.component';
import { LogWorkoutFormComponent } from './log-workout-form.component';
import type { ExerciseSetView, ExerciseView } from './log-workout-set-list.component';
import { LogWorkoutSetListComponent } from './log-workout-set-list.component';

@Component({
  selector: 'app-log-workout-inputs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LogWorkoutFormComponent, LogWorkoutSetListComponent],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-inline: 1rem;
      margin-top: 1rem;
      margin-bottom: 2rem;
    }
  `,
  template: `
    <app-log-workout-form [isAddingSet]="isAddingSet()" (addSet)="addSet($event)" />

    <app-log-workout-set-list
      [isLoading]="isLoading()"
      [skeletonSets]="skeletonSets"
      [exercises]="exercises()"
      [selectedExercise]="exercise()!"
      (setSelected)="setData($event)"
      [isEditing]="isEditing()!"
    />
  `,
})
export class LogWorkoutInputsComponent {
  readonly logsWorkoutService = inject(LogsWorkoutService);
  readonly userService = inject(UserService);

  readonly logWorkoutForm = viewChild(LogWorkoutFormComponent);

  readonly isLoading = input<boolean>(false);
  readonly itemId = input<string>();
  readonly exercise = input<string>();
  readonly logId = input<string>();
  readonly isEditing = input<boolean>();

  readonly skeletonSets = [1, 2, 3];
  readonly currentTime = signal<string>(this.getCurrentTime());
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
      time: formValue.time,
    };

    const pendingSetId = crypto.randomUUID();

    this.pendingSet.set({
      id: pendingSetId,
      exercise,
      time: formValue.time,
    });

    requestAnimationFrame(() => {
      this.logsWorkoutService.addLogWorkout(formValue.date, set, userId).subscribe({
        next: (workout) => {
          this.pendingSet.set(null);
          this.logsWorkoutService.logWorkoutResource.set(workout);
        },
        error: (error) => {
          this.pendingSet.set(null);
          console.error('Could not add workout set', error);
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

  private maxDecimalPlacesValidator(maxPlaces: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null;
      }

      const normalizedValue = String(value).replace(',', '.');

      if (!/^\d+(\.\d+)?$/.test(normalizedValue)) {
        return null;
      }

      const decimalPlaces = normalizedValue.split('.')[1]?.length ?? 0;

      return decimalPlaces > maxPlaces
        ? { maxDecimalPlaces: { max: maxPlaces, actual: decimalPlaces } }
        : null;
    };
  }

  private isNumberValidator(type: 'number' | 'integer' = 'number'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null;
      }

      const parsed = Number(value);

      if (!Number.isFinite(parsed)) {
        return { number: true };
      }

      if (type === 'integer' && !Number.isInteger(parsed)) {
        return { integer: true };
      }

      return null;
    };
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
