import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatDate, getCurrentUnixTimestamp, unixTimestampToDateValue } from '../../utils';

import { DatetimePickerModalComponent } from '../datetime-picker-modal/datetime-picker-modal.component';

import { WorkoutFormComponent, type LogWorkoutFormValue } from './workout-form.component';

type WorkoutFormTestApi = {
  readonly form: {
    controls: {
      load: {
        value: number | null;
        setValue(value: number | null): void;
        touched: boolean;
      };
      reps: {
        value: number | null;
        setValue(value: number | null): void;
        touched: boolean;
      };
      date: {
        value: number;
        setValue(value: number): void;
      };
      time: {
        value: string;
        setValue(value: string): void;
      };
      note: {
        value: string | null;
        setValue(value: string | null): void;
      };
    };
    invalid: boolean;
    patchValue(value: Partial<LogWorkoutFormValue>): void;
  };

  submit(): void;
  selectAllOnFreshFocus(event: Event): Promise<void>;
  resetSelectAllOnFocus(event: Event): Promise<void>;
  openTimePicker(): Promise<void>;
  openDatePicker(): Promise<void>;
};

describe('WorkoutFormComponent', () => {
  let fixture: ComponentFixture<WorkoutFormComponent>;
  let component: WorkoutFormComponent;
  let formComponent: WorkoutFormTestApi;

  const modalPresentMock = vi.fn().mockResolvedValue(undefined);
  const modalDismissMock = vi.fn();

  const modalMock = {
    present: modalPresentMock,
    onDidDismiss: modalDismissMock,
  };

  const modalControllerMock = {
    create: vi.fn().mockResolvedValue(modalMock),
  };

  const setValidForm = (): void => {
    const form = formComponent.form.controls;

    form.load.setValue(80);
    form.reps.setValue(10);
    form.note.setValue(null);
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 20, 19, 23, 45));

    vi.clearAllMocks();

    modalPresentMock.mockResolvedValue(undefined);
    modalControllerMock.create.mockResolvedValue(modalMock);

    await TestBed.configureTestingModule({
      imports: [WorkoutFormComponent],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerMock,
        },
      ],
    })
      .overrideComponent(WorkoutFormComponent, {
        set: {
          template: '',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkoutFormComponent);
    component = fixture.componentInstance;
    formComponent = component as unknown as WorkoutFormTestApi;

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should initialize load and reps as empty', () => {
      expect(component.formValueLoad()).toBeNull();
      expect(component.formValueReps()).toBeNull();
    });

    it('should initialize note as empty', () => {
      expect(component.formValueNote()).toBeNull();
    });

    it('should initialize current time', () => {
      expect(component.formValueTime()).toBe('19:23:45');
    });

    it('should initialize current date', () => {
      const expected = getCurrentUnixTimestamp();

      expect(component.formValueDate()).toBe(expected);
    });

    it('should expose formatted time', () => {
      expect(component.displayTime()).toBe('19:23');
    });

    it('should expose formatted date', () => {
      expect(component.displayDate()).toBe(formatDate(component.formValueDate()));
    });

    it('should expose date value for datetime picker', () => {
      expect(component.datetimeDateValue()).toBe(
        unixTimestampToDateValue(component.formValueDate()),
      );
    });

    it('should initially not mark time as manually changed', () => {
      expect(component.timeManuallyChanged()).toBe(false);
    });
  });

  describe('validation', () => {
    it('should be invalid when load and reps are empty', () => {
      expect(formComponent.form.invalid).toBe(true);
    });

    it('should accept valid load and reps', () => {
      setValidForm();

      expect(formComponent.form.invalid).toBe(false);
    });

    it('should reject load below minimum', () => {
      formComponent.form.controls.load.setValue(-1);
      formComponent.form.controls.reps.setValue(10);

      expect(formComponent.form.invalid).toBe(true);
    });

    it('should reject load above maximum', () => {
      formComponent.form.controls.load.setValue(301);
      formComponent.form.controls.reps.setValue(10);

      expect(formComponent.form.invalid).toBe(true);
    });

    it('should reject load with more than two decimal places', () => {
      formComponent.form.controls.load.setValue(80.123);
      formComponent.form.controls.reps.setValue(10);

      expect(formComponent.form.invalid).toBe(true);
    });

    it('should accept load with two decimal places', () => {
      formComponent.form.controls.load.setValue(80.25);
      formComponent.form.controls.reps.setValue(10);

      expect(formComponent.form.invalid).toBe(false);
    });

    it('should reject reps below minimum', () => {
      formComponent.form.controls.load.setValue(80);
      formComponent.form.controls.reps.setValue(0);

      expect(formComponent.form.invalid).toBe(true);
    });

    it('should reject reps above maximum', () => {
      formComponent.form.controls.load.setValue(80);
      formComponent.form.controls.reps.setValue(501);

      expect(formComponent.form.invalid).toBe(true);
    });

    it('should reject decimal reps', () => {
      formComponent.form.controls.load.setValue(80);
      formComponent.form.controls.reps.setValue(10.5);

      expect(formComponent.form.invalid).toBe(true);
    });
  });

  describe('patchForm', () => {
    it('should patch load, reps and note', () => {
      component.patchForm({
        load: 100,
        reps: 5,
        note: 'Heavy',
      });

      expect(component.formValueLoad()).toBe(100);
      expect(component.formValueReps()).toBe(5);
      expect(component.formValueNote()).toBe('Heavy');
    });

    it('should use null when note is undefined', () => {
      component.patchForm({
        load: 100,
        reps: 5,
      });

      expect(component.formValueNote()).toBeNull();
    });
  });

  describe('submit', () => {
    it('should emit valid form value', () => {
      const emitSpy = vi.spyOn(component.addSet, 'emit');

      setValidForm();

      formComponent.form.controls.note.setValue('Top set');

      formComponent.submit();

      expect(emitSpy).toHaveBeenCalledWith({
        load: 80,
        reps: 10,
        note: 'Top set',
        date: component.formValueDate(),
        time: component.formValueTime(),
      });
    });

    it('should trim note before emitting', () => {
      const emitSpy = vi.spyOn(component.addSet, 'emit');

      setValidForm();

      formComponent.form.controls.note.setValue('  Top set  ');

      formComponent.submit();

      expect(emitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          note: 'Top set',
        }),
      );
    });

    it('should convert whitespace-only note to null', () => {
      const emitSpy = vi.spyOn(component.addSet, 'emit');

      setValidForm();

      formComponent.form.controls.note.setValue('   ');

      formComponent.submit();

      expect(emitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          note: null,
        }),
      );
    });

    it('should not emit when form is invalid', () => {
      const emitSpy = vi.spyOn(component.addSet, 'emit');

      formComponent.submit();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should mark controls as touched when form is invalid', () => {
      formComponent.submit();

      expect(formComponent.form.controls.load.touched).toBe(true);
      expect(formComponent.form.controls.reps.touched).toBe(true);
    });

    it('should not emit while adding a set', () => {
      const emitSpy = vi.spyOn(component.addSet, 'emit');

      setValidForm();

      fixture.componentRef.setInput('isAddingSet', true);
      fixture.detectChanges();

      formComponent.submit();

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('time refresh', () => {
    it('should refresh time every 30 seconds', () => {
      expect(component.formValueTime()).toBe('19:23:45');

      vi.advanceTimersByTime(30_000);

      expect(component.formValueTime()).toBe('19:24:15');
    });

    it('should not refresh time after manual change', () => {
      component.timeManuallyChanged.set(true);

      formComponent.form.controls.time.setValue('17:30:00');

      vi.setSystemTime(new Date(2026, 8, 20, 19, 24, 15));

      vi.advanceTimersByTime(30_000);

      expect(component.formValueTime()).toBe('17:30:00');
    });
  });

  describe('input focus', () => {
    it('should select input on first focus', async () => {
      const select = vi.fn();

      const nativeInput = {
        select,
      } as unknown as HTMLInputElement;

      const ionInput = {
        getInputElement: vi.fn().mockResolvedValue(nativeInput),
      };

      await formComponent.selectAllOnFreshFocus({
        target: ionInput,
      } as unknown as Event);

      vi.advanceTimersByTime(50);

      expect(select).toHaveBeenCalledOnce();
    });

    it('should select input only once during same focus cycle', async () => {
      const select = vi.fn();

      const nativeInput = {
        select,
      } as unknown as HTMLInputElement;

      const ionInput = {
        getInputElement: vi.fn().mockResolvedValue(nativeInput),
      };

      const event = {
        target: ionInput,
      } as unknown as Event;

      await formComponent.selectAllOnFreshFocus(event);
      await formComponent.selectAllOnFreshFocus(event);

      vi.advanceTimersByTime(50);

      expect(select).toHaveBeenCalledOnce();
    });

    it('should allow selecting again after blur', async () => {
      const select = vi.fn();

      const nativeInput = {
        select,
      } as unknown as HTMLInputElement;

      const ionInput = {
        getInputElement: vi.fn().mockResolvedValue(nativeInput),
      };

      const event = {
        target: ionInput,
      } as unknown as Event;

      await formComponent.selectAllOnFreshFocus(event);

      vi.advanceTimersByTime(50);

      await formComponent.resetSelectAllOnFocus(event);

      await formComponent.selectAllOnFreshFocus(event);

      vi.advanceTimersByTime(50);

      expect(select).toHaveBeenCalledTimes(2);
    });
  });

  describe('openTimePicker', () => {
    it('should open time picker with current values', async () => {
      modalDismissMock.mockResolvedValue({
        role: 'cancel',
      });

      await formComponent.openTimePicker();

      expect(modalControllerMock.create).toHaveBeenCalledWith({
        component: DatetimePickerModalComponent,
        cssClass: 'datetime-modal',
        componentProps: {
          kind: 'time',
          value: '19:23:45',
          resetValue: '19:23:45',
        },
      });

      expect(modalPresentMock).toHaveBeenCalledOnce();
    });

    it('should update and normalize confirmed time', async () => {
      modalDismissMock.mockResolvedValue({
        role: 'confirm',
        data: '21:15',
      });

      await formComponent.openTimePicker();

      expect(component.formValueTime()).toBe('21:15:00');
      expect(component.timeManuallyChanged()).toBe(true);
    });

    it('should reset manual change flag when picker is cancelled', async () => {
      component.timeManuallyChanged.set(true);

      modalDismissMock.mockResolvedValue({
        role: 'cancel',
      });

      await formComponent.openTimePicker();

      expect(component.timeManuallyChanged()).toBe(false);
    });

    it('should ignore confirm result without string data', async () => {
      modalDismissMock.mockResolvedValue({
        role: 'confirm',
        data: null,
      });

      await formComponent.openTimePicker();

      expect(component.formValueTime()).toBe('19:23:45');
      expect(component.timeManuallyChanged()).toBe(false);
    });
  });

  describe('openDatePicker', () => {
    it('should open date picker with current values', async () => {
      modalDismissMock.mockResolvedValue({
        role: 'cancel',
      });

      await formComponent.openDatePicker();

      expect(modalControllerMock.create).toHaveBeenCalledWith({
        component: DatetimePickerModalComponent,
        cssClass: 'datetime-modal',
        componentProps: {
          kind: 'date',
          value: '2026-09-20',
          resetValue: '2026-09-20',
        },
      });

      expect(modalPresentMock).toHaveBeenCalledOnce();
    });

    it('should update confirmed date', async () => {
      modalDismissMock.mockResolvedValue({
        role: 'confirm',
        data: '2026-09-25',
      });

      await formComponent.openDatePicker();

      expect(component.datetimeDateValue()).toBe('2026-09-25');
      expect(component.displayDate()).toBe('25.09.2026');
    });

    it('should keep current date when picker is cancelled', async () => {
      const originalDate = component.formValueDate();

      modalDismissMock.mockResolvedValue({
        role: 'cancel',
      });

      await formComponent.openDatePicker();

      expect(component.formValueDate()).toBe(originalDate);
    });

    it('should ignore confirm result without string data', async () => {
      const originalDate = component.formValueDate();

      modalDismissMock.mockResolvedValue({
        role: 'confirm',
        data: undefined,
      });

      await formComponent.openDatePicker();

      expect(component.formValueDate()).toBe(originalDate);
    });
  });
});
