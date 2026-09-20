import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonIcon, IonInput, IonLabel, ModalController } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import { DatetimePickerModalComponent } from '../components';
import {
  formatDate,
  formatTime,
  getCurrentTime,
  getCurrentUnixTimestamp,
  maxDecimalPlacesValidator,
  normalizeDateForBackend,
  normalizeTimeForBackend,
  numberValidator,
  unixTimestampToDateValue,
} from '../utils';

export type LogWorkoutFormValue = {
  load: number;
  reps: number;
  note: string | null;
  date: number;
  time: string;
};

const ION_COMPONENTS = [IonButton, IonIcon, IonInput, IonLabel];

@Component({
  selector: 'app-log-workout-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, TranslateModule, ReactiveFormsModule],
  styles: `
    form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
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

        > *:not(:nth-child(3)) {
          flex: 2;
        }

        > *:nth-child(3) {
          flex: 3;
        }
      }

      &:nth-child(3) {
        > *:not(:nth-child(2)) {
          flex: 3;
        }

        > *:nth-child(2) {
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
      text-align: center;

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

    ion-button {
      margin: 0;
      min-height: 44px;
      --border-radius: var(--app-radius-1);

      height: 18px;
      width: 18px;
      font-size: 18px;

      transition:
        transform 120ms ease,
        filter 120ms ease,
        opacity 120ms ease;

      &:active:not(.button-disabled) {
        transform: translateY(1px) scale(0.97);
        filter: brightness(0.95);
      }
    }

    ion-modal.datetime-modal {
      --width: fit-content;
      --min-width: 280px;
      --height: auto;
      --border-radius: 16px;
      --box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
    }

    ion-modal.datetime-modal::part(content) {
      overflow: hidden;
    }

    ion-datetime {
      --background: var(--ion-background-color);
    }

    ion-input.custom-input.hydrated {
      --background: var(--ion-background-color);
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
          (ionFocus)="selectAllOnFreshFocus($event)"
          (ionBlur)="resetSelectAllOnFocus($event)"
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
          (ionFocus)="selectAllOnFreshFocus($event)"
          (ionBlur)="resetSelectAllOnFocus($event)"
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
          (click)="openTimePicker()"
        />

        <ion-input
          class="custom-input"
          [value]="displayDate()"
          readonly
          inputmode="text"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          (click)="openDatePicker()"
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

        <ion-button type="button" (click)="submit()" [disabled]="form.invalid || isAddingSet()">
          <ion-icon name="add" />
        </ion-button>
      </div>
    </form>
  `,
})
export class LogWorkoutFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly modalController = inject(ModalController);

  readonly isAddingSet = input<boolean>(false);
  readonly addSet = output<LogWorkoutFormValue>();

  protected readonly form = this.fb.group({
    load: [
      null as number | null,
      [
        Validators.required,
        numberValidator(),
        maxDecimalPlacesValidator(2),
        Validators.min(0),
        Validators.max(300),
      ],
    ],
    reps: [
      null as number | null,
      [Validators.required, numberValidator('integer'), Validators.min(1), Validators.max(500)],
    ],
    date: this.fb.nonNullable.control<number>(getCurrentUnixTimestamp()),
    time: this.fb.nonNullable.control<string>(getCurrentTime()),
    note: this.fb.control<string | null>(null),
  });

  readonly formValueLoad = toSignal(this.form.controls.load.valueChanges, {
    initialValue: this.form.controls.load.value,
  });

  readonly formValueReps = toSignal(this.form.controls.reps.valueChanges, {
    initialValue: this.form.controls.reps.value,
  });

  readonly formValueNote = toSignal(this.form.controls.note.valueChanges, {
    initialValue: this.form.controls.note.value,
  });

  readonly formValueTime = toSignal(this.form.controls.time.valueChanges, {
    initialValue: this.form.controls.time.value,
  });

  readonly displayTime = computed(() => {
    return formatTime(this.formValueTime());
  });

  readonly displayDate = computed(() => {
    return formatDate(this.form.value.date ?? 0);
  });

  readonly timeManuallyChanged = signal<boolean>(false);

  protected readonly datetimeDateValue = computed<string>(() => {
    return unixTimestampToDateValue(this.form.controls.date.value);
  });

  private selectedDuringFocus = new WeakSet<HTMLInputElement>();

  constructor() {
    const REFRESH_INTERVAL = 30_000;
    const intervalId = window.setInterval(() => {
      if (this.timeManuallyChanged()) return;
      this.form.controls.time.setValue(getCurrentTime());
    }, REFRESH_INTERVAL);

    this.destroyRef.onDestroy(() => {
      window.clearInterval(intervalId);
    });
  }

  patchForm(set: { load: number; reps: number; note?: string | null }): void {
    this.form.patchValue({
      load: set.load,
      reps: set.reps,
      note: set.note ?? null,
    });
  }

  protected submit(): void {
    if (this.form.invalid || this.isAddingSet()) {
      this.form.markAllAsTouched();
      return;
    }

    const { load, reps, note, date, time } = this.form.getRawValue();

    if (load === null || load === undefined || reps === null || reps === undefined) {
      return;
    }

    this.addSet.emit({
      load: Number(load),
      reps: Number(reps),
      note: note?.trim() || null,
      date,
      time,
    });
  }

  protected async selectAllOnFreshFocus(event: Event): Promise<void> {
    const ionInput = event.target as HTMLIonInputElement;
    const nativeInput = await ionInput.getInputElement();

    if (this.selectedDuringFocus.has(nativeInput)) {
      return;
    }

    this.selectedDuringFocus.add(nativeInput);
    setTimeout(() => {
      nativeInput.select();
    }, 50);
  }

  protected async resetSelectAllOnFocus(event: Event): Promise<void> {
    const ionInput = event.target as HTMLIonInputElement;
    const nativeInput = await ionInput.getInputElement();

    this.selectedDuringFocus.delete(nativeInput);
  }

  protected async openTimePicker(): Promise<void> {
    const modal = await this.modalController.create({
      component: DatetimePickerModalComponent,
      cssClass: 'datetime-modal',
      componentProps: {
        kind: 'time',
        value: this.formValueTime(),
        resetValue: this.getCurrentTimeForDatetime(),
      },
    });
    await modal.present();

    const result = await modal.onDidDismiss<string>();
    if (result.role !== 'confirm' || typeof result.data !== 'string') {
      this.timeManuallyChanged.set(false);
      return;
    }

    const normalizedTime = normalizeTimeForBackend(result.data);
    this.timeManuallyChanged.set(true);
    this.form.controls.time.setValue(normalizedTime);
  }

  protected async openDatePicker(): Promise<void> {
    const modal = await this.modalController.create({
      component: DatetimePickerModalComponent,
      cssClass: 'datetime-modal',
      componentProps: {
        kind: 'date',
        value: this.datetimeDateValue(),
        resetValue: this.getCurrentDateForDatetime(),
      },
    });
    await modal.present();

    const result = await modal.onDidDismiss<string>();
    if (result.role !== 'confirm' || typeof result.data !== 'string') return;

    this.form.patchValue({
      date: normalizeDateForBackend(result.data),
    });
  }

  protected getCurrentTimeForDatetime(): string {
    return getCurrentTime().substring(0, 5);
  }

  protected getCurrentDateForDatetime(): string {
    return unixTimestampToDateValue(getCurrentUnixTimestamp());
  }
}
