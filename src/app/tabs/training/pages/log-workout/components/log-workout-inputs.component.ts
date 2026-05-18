import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonSkeletonText,
} from '@ionic/angular/standalone';

import { TranslateModule } from '@ngx-translate/core';

import type { WorkoutSet } from '../../../../../models';
import { UserService } from '../../../../../services';
import { LogsWorkoutService } from '../../../services';
import { ExerciseItemComponent } from '../../workout/components';

const ION_COMPONENTS = [
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonSkeletonText,
];

type ExerciseSetView =
  | {
      type: 'set';
      set: WorkoutSet;
    }
  | {
      type: 'skeleton';
      id: string;
      exercise: string;
      time: string;
    };

type ExerciseView = {
  name: string;
  sets: ExerciseSetView[];
};

@Component({
  selector: 'app-log-workout-inputs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, TranslateModule, ReactiveFormsModule, ExerciseItemComponent],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-inline: 1rem;
      margin-top: 1rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .row {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 1rem;

      &:nth-child(1) {
        > * {
          flex: 1;
        }
      }

      &:nth-child(2) {
        text-align: center;

        > *:not(:last-child) {
          flex: 2;
        }

        > *:last-child {
          flex: 3;
        }
      }

      &:nth-child(3) {
        > *:not(:last-child) {
          flex: 3;
        }

        > *:last-child {
          flex: 2;
        }
      }
    }

    ion-input {
      --ion-background: white;
      --ion-background-color: white;

      @media (prefers-color-scheme: dark) {
        --ion-background: black;
        --ion-background-color: black;
      }
    }

    ion-input.ng-invalid.ng-touched {
      --border-color: var(--ion-color-danger);
    }

    ion-input ::ng-deep input.native-input,
    ion-label.break-timer {
      padding-inline: 0.75rem;
    }

    ion-input[type='number'] {
      text-align: right;

      ::ng-deep label.input-wrapper {
        padding-inline: 0.75rem;
      }

      [slot='end']:first-of-type {
        -webkit-margin-start: 5px;
        margin-inline-start: 5px;
      }

      ::ng-deep .label-text-wrapper {
        font-size: 10px;
      }
    }

    ion-item-divider {
      min-height: 40px;
      background-color: transparent;
      margin-top: 1rem;
      --padding-start: 12px;
    }

    ion-button {
      margin: 0;
      min-height: 44px;
      --border-radius: 0;

      height: 18px;
      width: 18px;
      font-size: 18px;

      // animation
      transition:
        transform 120ms ease,
        filter 120ms ease,
        opacity 120ms ease;

      &:active:not(.button-disabled) {
        transform: translateY(1px) scale(0.97);
        filter: brightness(0.95);
      }
    }

    .col {
      display: flex;
      flex-direction: column;
      width: 100%;
      margin-top: 1rem;
      gap: 0.5rem;

      .log-set {
        --min-height: 32px;
        ion-label {
          margin-top: 2px;
          margin-bottom: 2px;
          margin-inline-end: 0;
        }
      }
    }

    .item-container {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      ion-label {
        display: flex;
        justify-content: space-between;
        h3 {
          margin-bottom: 0;
        }
      }
    }

    // skeleton stuff
    .exercise-skeleton-title {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
    }

    .rounded-skeleton {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      flex: 0 0 auto;
    }

    .title-skeleton {
      width: 60%;
      height: 1rem;
      border-radius: 999px;
    }

    .skeleton-log-set {
      pointer-events: none;
    }

    .set-index-skeleton {
      width: 6%;
      height: 0.875rem;
      border-radius: 999px;
    }

    .set-value-skeleton {
      width: 25%;
      height: 0.875rem;
      border-radius: 999px;
    }

    .set-time-skeleton {
      width: 22%;
      height: 0.875rem;
      border-radius: 999px;
    }

    .set-break-skeleton {
      width: 14%;
      height: 0.875rem;
      border-radius: 999px;
    }
  `,
  template: `
    <form [formGroup]="form">
      <div class="row">
        <ion-input
          class="custom-input"
          type="number"
          inputmode="decimal"
          [label]="'tabs.training.log-workout.inputs.load.label' | translate"
          [name]="'tabs.training.log-workout.inputs.load.name' | translate"
          formControlName="load"
          [min]="0"
          [max]="300"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        >
          <span slot="end">kg</span>
        </ion-input>

        <ion-input
          class="custom-input"
          type="number"
          inputmode="numeric"
          [label]="'tabs.training.log-workout.inputs.reps.label' | translate"
          [name]="'tabs.training.log-workout.inputs.reps.name' | translate"
          formControlName="reps"
          [min]="1"
          [max]="500"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        >
          <span slot="end">x</span>
        </ion-input>
      </div>

      <div class="row">
        <ion-label class="break-timer">00:00</ion-label>

        <ion-input
          class="custom-input"
          [value]="displayTime()"
          readonly
          inputmode="text"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />

        <ion-input
          class="custom-input"
          [value]="displayDate()"
          readonly
          inputmode="text"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />
      </div>

      <div class="row">
        <ion-input
          class="custom-input"
          name="note"
          placeholder="Notizen"
          formControlName="note"
          inputmode="text"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />
        <ion-button type="button" (click)="addSet()" [disabled]="form.invalid || isAddingSet()">
          <ion-icon name="add"></ion-icon>
        </ion-button>
      </div>
    </form>

    <div class="col">
      @if (isLoading()) {
        <ion-item-group>
          <ion-item-divider>
            <div class="exercise-skeleton-title">
              <ion-skeleton-text animated class="rounded-skeleton" />
              <ion-skeleton-text animated class="title-skeleton" />
            </div>
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
      } @else {
        @for (exerciseGroup of exercises(); track exerciseGroup.name) {
          <ion-item-group>
            <ion-item-divider>
              <app-exercise-item [exercise]="exerciseGroup.name" />
            </ion-item-divider>

            <div class="item-container">
              @for (
                item of exerciseGroup.sets;
                track item.type === 'set' ? item.set.itemId : item.id;
                let idx = $index
              ) {
                @if (item.type === 'skeleton') {
                  <ion-item class="log-set skeleton-log-set" lines="none">
                    <ion-label>
                      <ion-skeleton-text animated class="set-index-skeleton" />
                      <ion-skeleton-text animated class="set-value-skeleton" />
                      <ion-skeleton-text animated class="set-time-skeleton" />
                      <ion-skeleton-text animated class="set-break-skeleton" />
                    </ion-label>
                  </ion-item>
                } @else {
                  <ion-item
                    class="log-set ion-activatable"
                    lines="none"
                    (click)="setData(item.set)"
                  >
                    <ion-label>
                      <h3>#{{ idx + 1 }}</h3>
                      <h3>{{ item.set.reps }}x {{ item.set.load }} kg</h3>
                      <h3>{{ item.set.time }}</h3>
                    </ion-label>
                  </ion-item>
                }
              }
            </div>
          </ion-item-group>
        }
      }
    </div>
  `,
})
export class LogWorkoutInputsComponent {
  private readonly fb = inject(FormBuilder);
  readonly isLoading = input<boolean>(false);
  readonly skeletonSets = [1, 2, 3];
  readonly logsWorkoutService = inject(LogsWorkoutService);
  readonly userService = inject(UserService);

  readonly itemId = input<string>();
  readonly exercise = input<string>();
  readonly logId = input<string>();

  readonly form = this.fb.group({
    load: [
      null as number | null,
      [
        Validators.required,
        this.isNumberValidator(),
        this.maxDecimalPlacesValidator(2),
        Validators.min(0),
        Validators.max(300),
      ],
    ],
    reps: [
      null as number | null,
      [
        Validators.required,
        this.isNumberValidator('integer'),
        Validators.min(1),
        Validators.max(500),
      ],
    ],
    date: this.fb.nonNullable.control<string>(Date.now().toString()),
    time: this.fb.nonNullable.control<string>(this.getCurrentTime()),
    note: this.fb.control<string | null>(null),
  });

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

  private getNewestExerciseTime(exercise: ExerciseView): number {
    const newestSet = exercise.sets[exercise.sets.length - 1];

    if (!newestSet) return 0;

    return newestSet.type === 'set'
      ? this.timeToSeconds(newestSet.set.time)
      : this.timeToSeconds(newestSet.time);
  }

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const REFRESH_INTERVAL = 30_000;
    const intervalId = window.setInterval(() => {
      this.form.controls.time.setValue(this.getCurrentTime());
    }, REFRESH_INTERVAL);

    this.destroyRef.onDestroy(() => {
      window.clearInterval(intervalId);
    });
  }

  addSet(): void {
    if (this.form.invalid || this.isAddingSet()) {
      this.form.markAllAsTouched();
      return;
    }

    const logId = this.logsWorkoutService.logId();
    const userId = this.userService.user().id;
    const exercise = this.exercise();

    if (!logId || !userId || !exercise) {
      console.error('Missing required data for addSet', {
        logId,
        userId,
        exercise,
      });
      return;
    }

    const { load, reps, note } = this.form.getRawValue();

    if (load === null || load === undefined || reps === null || reps === undefined) {
      return;
    }

    const time = this.getCurrentTime();

    const set: WorkoutSet = {
      load: Number(load),
      reps: Number(reps),
      exercise,
      itemId: this.getNextItemId(),
      note: note?.trim() || null,
      time,
    };

    const pendingSetId = crypto.randomUUID();

    this.pendingSet.set({
      id: pendingSetId,
      exercise,
      time,
    });

    const date = Date.now().toString();
    requestAnimationFrame(() => {
      this.logsWorkoutService.addLogWorkout(date, set, userId).subscribe({
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
    this.form.patchValue({ load: set.load, reps: set.reps, note: set.note });
  }

  private isNumberValidator(type: 'number' | 'integer' = 'number'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return null;

      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return { number: true };
      if (type === 'integer' && !Number.isInteger(parsed)) return { integer: true };

      return null;
    };
  }

  private getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  readonly displayTime = computed(() => {
    return this.formatTime(this.form.controls.time.value);
  });

  private formatTime(value: string): string {
    return value.substring(0, value.length - 3);
  }

  readonly displayDate = computed(() => {
    return this.formatDate(this.form.controls.date.value);
  });

  private formatDate(value: string): string {
    const date = new Date(Number(value));
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
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
