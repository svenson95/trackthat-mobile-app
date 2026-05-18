import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonInput,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
} from '@ionic/angular/standalone';

import { TranslateModule } from '@ngx-translate/core';

import { ExerciseItemComponent } from '../../workout/components';

const ION_COMPONENTS = [IonButton, IonInput, IonLabel, IonItem, IonItemGroup, IonItemDivider];

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
    }

    ion-button {
      margin: 0;
      min-height: 40px;
      --border-radius: 0;
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
          value="19:23"
          readonly
          inputmode="text"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />
        <ion-input
          class="custom-input"
          value="17.05.2025"
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
        <ion-button type="button" (click)="addSet()" [disabled]="form.invalid"> + </ion-button>
      </div>
    </form>

    <div class="col">
      @for (exercise of EXERCISES; track exercise.name; let last = $last) {
        <ion-item-group>
          <ion-item-divider>
            <app-exercise-item [exerciseName]="exercise.name" />
          </ion-item-divider>
          <div class="item-container">
            @for (set of exercise.sets; track set.exercise; let last = $last; let idx = $index) {
              <ion-item class="log-set" lines="none">
                <ion-label>
                  <h3>#{{ idx + 1 }}</h3>
                  <h3>{{ set.reps }}x {{ set.load }} kg</h3>
                  <h3>{{ set.time }}</h3>
                </ion-label>
              </ion-item>
            }
          </div>
        </ion-item-group>
      }
    </div>
  `,
})
export class LogWorkoutInputsComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    load: [
      null as number | null,
      [Validators.required, this.isNumberValidator(), Validators.min(0), Validators.max(300)],
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
    note: this.fb.control<string | null>(null),
  });

  EXERCISES = [
    {
      name: 'benchpress_dumbbell',
      sets: [
        {
          load: 20,
          reps: 10,
          exercise: 'benchpress_dumbbell',
          itemId: 0,
          note: null,
          time: '19:25:35',
        },
        {
          load: 20,
          reps: 9,
          exercise: 'benchpress_dumbbell',
          itemId: 1,
          note: null,
          time: '19:27:00',
        },
        {
          load: 20,
          reps: 8,
          exercise: 'benchpress_dumbbell',
          itemId: 2,
          note: null,
          time: '19:28:40',
        },
      ],
    },
    {
      name: 'biceps_curls_standing_dumbbell',
      sets: [
        {
          load: 12.5,
          reps: 12,
          exercise: 'biceps_curls_standing_dumbbell',
          itemId: 3,
          note: 'Hammer',
          time: '19:22:30',
        },
        {
          load: 10,
          reps: 15,
          exercise: 'biceps_curls_standing_dumbbell',
          itemId: 4,
          note: 'Hammer',
          time: '19:23:55',
        },
      ],
    },
  ];

  addSet(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { load, reps, note } = this.form.getRawValue();
    if (!load || !reps) return;

    // this.sets = [
    //   ...this.sets,
    //   {
    //     load: Number(load),
    //     reps,
    //     note: note?.trim() || null,
    //     exercise: 'benchpress_dumbbell',
    //     itemId: Date.now(),
    //   },
    // ];
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
}
