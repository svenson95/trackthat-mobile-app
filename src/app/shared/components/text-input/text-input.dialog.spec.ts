import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TextInputDialog } from './text-input.dialog';

describe('TextInputDialog', () => {
  const modalControllerMock = {
    dismiss: vi.fn(),
  };

  let component: TextInputDialog;

  beforeEach(async () => {
    vi.clearAllMocks();

    modalControllerMock.dismiss.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [TextInputDialog],
      providers: [
        provideTranslateService(),
        {
          provide: ModalController,
          useValue: modalControllerMock,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TextInputDialog);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial value', () => {
    it('should store the trimmed initial value on init', async () => {
      component.value = '  Workout name  ';

      await component.ngOnInit();

      expect(component.initialValue).toBe('Workout name');
    });
  });

  describe('validation', () => {
    it('should be invalid when the value is empty', () => {
      component.initialValue = 'Workout';
      component.value = '   ';

      expect(component.isValueInvalid).toBe(true);
    });

    it('should be invalid when the value has not changed', () => {
      component.initialValue = 'Workout';
      component.value = 'Workout';

      expect(component.isValueInvalid).toBe(true);
    });

    it('should ignore surrounding whitespace when comparing the value', () => {
      component.initialValue = 'Workout';
      component.value = '  Workout  ';

      expect(component.isValueInvalid).toBe(true);
    });

    it('should be valid when the value has changed', () => {
      component.initialValue = 'Workout';
      component.value = 'New workout';

      expect(component.isValueInvalid).toBe(false);
    });

    it('should detect values exceeding the maximum length', () => {
      component.value = '123456';
      component.maxLength = 5;

      expect(component.isValueTooLong).toBe(true);
      expect(component.isValueInvalid).toBe(true);
    });

    it('should allow values equal to the maximum length', () => {
      component.initialValue = '';
      component.value = '12345';
      component.maxLength = 5;

      expect(component.isValueTooLong).toBe(false);
      expect(component.isValueInvalid).toBe(false);
    });

    it('should not apply length validation without a maximum length', () => {
      component.initialValue = '';
      component.value = 'A very long value';
      component.maxLength = undefined;

      expect(component.isValueTooLong).toBe(false);
    });
  });

  describe('close', () => {
    it('should dismiss the modal without a value', async () => {
      await component.close();

      expect(modalControllerMock.dismiss).toHaveBeenCalledOnce();
      expect(modalControllerMock.dismiss).toHaveBeenCalledWith();
    });
  });

  describe('save', () => {
    it('should dismiss the modal with the trimmed value', async () => {
      component.value = '  New workout  ';

      await component.save();

      expect(modalControllerMock.dismiss).toHaveBeenCalledWith('New workout');
    });

    it('should not dismiss the modal when the value exceeds the maximum length', async () => {
      component.value = '123456';
      component.maxLength = 5;

      await component.save();

      expect(modalControllerMock.dismiss).not.toHaveBeenCalled();
    });

    it('should save a value equal to the maximum length', async () => {
      component.value = '12345';
      component.maxLength = 5;

      await component.save();

      expect(modalControllerMock.dismiss).toHaveBeenCalledWith('12345');
    });
  });
});
