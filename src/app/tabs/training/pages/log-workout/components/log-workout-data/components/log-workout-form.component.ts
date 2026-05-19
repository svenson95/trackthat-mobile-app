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
import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonButton, IonIcon, IonInput, IonLabel } from '@ionic/angular/standalone';

import { TranslateModule } from '@ngx-translate/core';

import { HealthService } from '../../../../../../../services';
import { DatetimePickerModalComponent } from '../../../dialogs';

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

    ion-button {
      margin: 0;
      min-height: 44px;
      --border-radius: 0;

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
          (ionFocus)="startPolling(); selectAllOnFreshFocus($event)"
          (ionInput)="startPolling()"
          (ionBlur)="stopPolling(); resetSelectAllOnFocus($event)"
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
          (ionFocus)="startPolling(); selectAllOnFreshFocus($event)"
          (ionInput)="startPolling()"
          (ionBlur)="stopPolling(); resetSelectAllOnFocus($event)"
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

  readonly isAddingSet = input<boolean>(false);
  readonly addSet = output<LogWorkoutFormValue>();

  private readonly healthService = inject(HealthService);
  readonly startPolling = (): void => this.healthService.startPolling();
  readonly stopPolling = (): void => this.healthService.stopPolling();

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
    date: this.fb.nonNullable.control<number>(this.getCurrentUnixTimestamp()),
    time: this.fb.nonNullable.control<string>(this.getCurrentTime()),
    note: this.fb.control<string | null>(null),
  });

  readonly formValueTime = toSignal(this.form.controls.time.valueChanges, {
    initialValue: this.form.controls.time.value,
  });

  readonly displayTime = computed(() => {
    return this.formatTime(this.formValueTime());
  });

  readonly displayDate = computed(() => {
    return this.formatDate(this.form.value.date ?? 0);
  });

  private readonly timeManuallyChanged = signal(false);

  constructor() {
    const REFRESH_INTERVAL = 30_000;
    const intervalId = window.setInterval(() => {
      if (this.timeManuallyChanged()) return;
      this.form.controls.time.setValue(this.getCurrentTime());
    }, REFRESH_INTERVAL);

    this.destroyRef.onDestroy(() => {
      window.clearInterval(intervalId);
      this.healthService.stopPolling();
    });
  }

  submit(): void {
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

  patchForm(set: { load: number; reps: number; note?: string | null }): void {
    this.form.patchValue({
      load: set.load,
      reps: set.reps,
      note: set.note ?? null,
    });
  }

  private maxDecimalPlacesValidator(maxPlaces: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === undefined || value === '') {
        return null;
      }

      const normalizedValue = String(value).replace(',', '.');
      if (!/^\d+(\.\d+)?$/.test(normalizedValue)) return null;
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

  private getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  private formatTime(value: string): string {
    return value.substring(0, value.length - 3);
  }

  private formatDate(value: number): string {
    const date = new Date(value * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  private selectedDuringFocus = new WeakSet<HTMLInputElement>();

  async selectAllOnFreshFocus(event: Event): Promise<void> {
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

  async resetSelectAllOnFocus(event: Event): Promise<void> {
    const ionInput = event.target as HTMLIonInputElement;
    const nativeInput = await ionInput.getInputElement();

    this.selectedDuringFocus.delete(nativeInput);
  }

  private readonly modalController = inject(ModalController);

  readonly datetimeDateValue = computed(() => {
    return this.unixTimestampToDateValue(this.form.controls.date.value);
  });

  async openTimePicker(): Promise<void> {
    const modal = await this.modalController.create({
      component: DatetimePickerModalComponent,
      cssClass: 'datetime-modal',
      componentProps: {
        kind: 'time',
        value: this.form.controls.time.value.substring(0, 5),
        resetValue: this.getCurrentTimeForDatetime(),
      },
    });
    await modal.present();

    const result = await modal.onDidDismiss<string>();
    if (result.role !== 'confirm' || typeof result.data !== 'string') return;

    const normalizedTime = this.normalizeTimeForBackend(result.data);
    this.timeManuallyChanged.set(true);
    this.form.controls.time.setValue(normalizedTime);
  }

  async openDatePicker(): Promise<void> {
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
      date: this.normalizeDateForBackend(result.data),
    });
  }

  getCurrentTimeForDatetime(): string {
    return this.getCurrentTime().substring(0, 5);
  }

  getCurrentDateForDatetime(): string {
    return this.unixTimestampToDateValue(this.getCurrentUnixTimestamp());
  }

  private getCurrentUnixTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  private normalizeTimeForBackend(value: string): string {
    const time = value.includes('T') ? value.split('T')[1] : value;
    const cleanTime = time.replace('Z', '').split('.')[0];
    const [hours = '00', minutes = '00', seconds] = cleanTime.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds?.padStart(2, '0') ?? '00'}`;
  }

  private unixTimestampToDateValue(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private normalizeDateForBackend(value: string): number {
    const dateValue = value.split('T')[0];
    const [year, month, day] = dateValue.split('-').map(Number);
    return Math.floor(new Date(year, month - 1, day, 0, 0, 0, 0).getTime() / 1000);
  }
}
