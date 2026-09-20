import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { IonModal, LoadingController, provideIonicAngular } from '@ionic/angular';
import type { OverlayEventDetail } from '@ionic/core';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { provideTestTranslations } from '../../../../../../../testing/translate-testing.provider';
import type { Workout, WorkoutDoc } from '../../../../../../core';
import { IonicUiService } from '../../../../../../shared';

import { WorkoutsService } from '../../../../data-access';

import { AddWorkoutModalComponent } from './add-workout-modal.component';
import { WORKOUT_TEMPLATES } from './workout-templates.data';

type AddWorkoutModalTestApi = {
  readonly INPUT_MAX_LENGTH: number;
  readonly isLoading: {
    (): boolean;
    set(value: boolean): void;
  };

  name: string;
  templateId: number;

  readonly hasValidName: boolean;

  cancel(): Promise<void>;
  confirm(): Promise<void>;
  onModalDismiss(event: CustomEvent<OverlayEventDetail<WorkoutDoc>>): void;
};

describe('AddWorkoutModalComponent', () => {
  let component: AddWorkoutModalComponent;
  let fixture: ComponentFixture<AddWorkoutModalComponent>;
  let modalComponent: AddWorkoutModalTestApi;

  const workout: Workout = {
    userId: '1',
    workoutId: 1,
    listId: 0,
    name: 'Push',
    list: [],
    lastUpdated: 0,
  };

  const workoutDoc: WorkoutDoc = {
    id: 'workout-1',
    userId: 'test-user',
    workoutId: 1,
    listId: 0,
    name: 'Push',
    lastUpdated: 0,
    list: [],
  };

  const workoutsServiceMock = {
    initWorkout: vi.fn((_name: string, _list: Workout['list']) => workout),
    addWorkout: vi.fn(() => of(workoutDoc)),
  };

  const ionicUiServiceMock = {
    showError: vi.fn().mockResolvedValue(undefined),
  };

  const loadingMock = {
    present: vi.fn().mockResolvedValue(undefined),
    dismiss: vi.fn().mockResolvedValue(undefined),
  };

  const loadingControllerMock = {
    create: vi.fn().mockResolvedValue(loadingMock),
  };

  const routerMock = {
    navigate: vi.fn().mockResolvedValue(true),
  };

  function getIonModal(): IonModal {
    return fixture.debugElement.query(By.directive(IonModal)).componentInstance as IonModal;
  }

  beforeEach(async () => {
    vi.clearAllMocks();

    workoutsServiceMock.initWorkout.mockReturnValue(workout);
    workoutsServiceMock.addWorkout.mockReturnValue(of(workoutDoc));

    loadingControllerMock.create.mockResolvedValue(loadingMock);

    await TestBed.configureTestingModule({
      imports: [AddWorkoutModalComponent],
      providers: [
        provideIonicAngular(),
        provideTestTranslations(),
        {
          provide: WorkoutsService,
          useValue: workoutsServiceMock,
        },
        {
          provide: IonicUiService,
          useValue: ionicUiServiceMock,
        },
        {
          provide: LoadingController,
          useValue: loadingControllerMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddWorkoutModalComponent);
    component = fixture.componentInstance;

    modalComponent = component as unknown as AddWorkoutModalTestApi;

    fixture.detectChanges();
  });

  describe('creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('validation', () => {
    it('should reject an empty name', () => {
      modalComponent.name = '   ';

      expect(modalComponent.hasValidName).toBe(false);
    });

    it('should accept a valid name', () => {
      modalComponent.name = 'Push';

      expect(modalComponent.hasValidName).toBe(true);
    });

    it('should reject a name exceeding the maximum length', () => {
      modalComponent.name = 'a'.repeat(modalComponent.INPUT_MAX_LENGTH + 1);

      expect(modalComponent.hasValidName).toBe(false);
    });

    it('should accept a name with the maximum allowed length', () => {
      modalComponent.name = 'a'.repeat(modalComponent.INPUT_MAX_LENGTH);

      expect(modalComponent.hasValidName).toBe(true);
    });
  });

  describe('present', () => {
    it('should present the modal', async () => {
      const modal = getIonModal();
      const presentSpy = vi.spyOn(modal, 'present').mockResolvedValue();

      await component.present();

      expect(presentSpy).toHaveBeenCalledOnce();
    });
  });

  describe('cancel', () => {
    it('should dismiss the modal with the cancel role', async () => {
      const modal = getIonModal();
      const dismissSpy = vi.spyOn(modal, 'dismiss').mockResolvedValue(true);

      await modalComponent.cancel();

      expect(dismissSpy).toHaveBeenCalledWith(null, 'cancel');
    });
  });

  describe('confirm', () => {
    it('should not save an invalid workout', async () => {
      modalComponent.name = '   ';

      await modalComponent.confirm();

      expect(workoutsServiceMock.initWorkout).not.toHaveBeenCalled();
      expect(workoutsServiceMock.addWorkout).not.toHaveBeenCalled();
      expect(loadingControllerMock.create).not.toHaveBeenCalled();
    });

    it('should not save while already loading', async () => {
      modalComponent.name = 'Push';
      modalComponent.isLoading.set(true);

      await modalComponent.confirm();

      expect(workoutsServiceMock.initWorkout).not.toHaveBeenCalled();
      expect(workoutsServiceMock.addWorkout).not.toHaveBeenCalled();
      expect(loadingControllerMock.create).not.toHaveBeenCalled();
    });

    it('should trim the name and save the workout', async () => {
      modalComponent.name = '  Push  ';

      const modal = getIonModal();
      const dismissSpy = vi.spyOn(modal, 'dismiss').mockResolvedValue(true);

      await modalComponent.confirm();

      expect(workoutsServiceMock.initWorkout).toHaveBeenCalledWith('Push', []);
      expect(workoutsServiceMock.addWorkout).toHaveBeenCalledWith(workout);

      expect(loadingControllerMock.create).toHaveBeenCalledWith({
        message: 'tabs.training.workouts.actions.add-workout.process',
        spinner: 'circles',
      });

      expect(loadingMock.present).toHaveBeenCalledOnce();
      expect(loadingMock.dismiss).toHaveBeenCalledOnce();

      expect(dismissSpy).toHaveBeenCalledWith(workoutDoc, 'confirm');

      expect(modalComponent.isLoading()).toBe(false);
    });

    it('should create the workout from the selected template', async () => {
      const template = WORKOUT_TEMPLATES[0];

      modalComponent.name = 'Push';
      modalComponent.templateId = template.workoutId;

      const modal = getIonModal();
      vi.spyOn(modal, 'dismiss').mockResolvedValue(true);

      await modalComponent.confirm();

      expect(workoutsServiceMock.initWorkout).toHaveBeenCalledWith('Push', template.list);
    });

    it('should show the duplicate workout error for status 409', async () => {
      modalComponent.name = 'Push';

      workoutsServiceMock.addWorkout.mockReturnValueOnce(
        throwError(() => ({
          status: 409,
        })),
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await modalComponent.confirm();

      expect(ionicUiServiceMock.showError).toHaveBeenCalledWith(
        'tabs.training.workouts.actions.add-workout.already-exists',
      );

      expect(loadingMock.dismiss).toHaveBeenCalledOnce();
      expect(modalComponent.isLoading()).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should show the generic error for an unknown error', async () => {
      modalComponent.name = 'Push';

      workoutsServiceMock.addWorkout.mockReturnValueOnce(throwError(() => new Error('Failed')));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await modalComponent.confirm();

      expect(ionicUiServiceMock.showError).toHaveBeenCalledWith('general.unknown-error');

      expect(loadingMock.dismiss).toHaveBeenCalledOnce();
      expect(modalComponent.isLoading()).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should not dismiss the modal after saving fails', async () => {
      modalComponent.name = 'Push';

      workoutsServiceMock.addWorkout.mockReturnValueOnce(throwError(() => new Error('Failed')));

      const modal = getIonModal();
      const dismissSpy = vi.spyOn(modal, 'dismiss').mockResolvedValue(true);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await modalComponent.confirm();

      expect(dismissSpy).not.toHaveBeenCalled();
      expect(modalComponent.isLoading()).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('dismiss', () => {
    it('should navigate to the created workout after confirmation', () => {
      modalComponent.onModalDismiss(
        new CustomEvent<OverlayEventDetail<WorkoutDoc>>('willDismiss', {
          detail: {
            data: workoutDoc,
            role: 'confirm',
          },
        }),
      );

      expect(routerMock.navigate).toHaveBeenCalledWith(['tabs', 'training', workoutDoc.workoutId]);
    });

    it('should not navigate when the modal was cancelled', () => {
      modalComponent.onModalDismiss(
        new CustomEvent<OverlayEventDetail<WorkoutDoc>>('willDismiss', {
          detail: {
            role: 'cancel',
          },
        }),
      );

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should not navigate without workout data', () => {
      modalComponent.onModalDismiss(
        new CustomEvent<OverlayEventDetail<WorkoutDoc>>('willDismiss', {
          detail: {
            role: 'confirm',
          },
        }),
      );

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });
});
