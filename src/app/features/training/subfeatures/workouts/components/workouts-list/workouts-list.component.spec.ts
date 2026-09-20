import { signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  LoadingController,
  ModalController,
  provideIonicAngular,
  type IonItemSliding,
  type ItemReorderEventDetail,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { listOutline } from 'ionicons/icons';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { provideTestTranslations } from '../../../../../../../testing/translate-testing.provider';
import type { PostWorkoutBody, WorkoutDoc } from '../../../../../../core';
import { IonicUiService, TextInputDialog } from '../../../../../../shared';

import { WorkoutsService } from '../../../../data-access';
import { WORKOUT_NAME_MAX_LENGTH } from '../../../../utils';

import { WorkoutsEditorState } from '../../state';

import { WorkoutsListComponent } from './workouts-list.component';

type WorkoutsListTestApi = {
  displayedWorkouts(): WorkoutDoc[];
  hasError(): boolean;
  hasWorkoutsValue(): boolean;
  isInitialLoading(): boolean;

  handleReorder(event: CustomEvent<ItemReorderEventDetail>): void;

  openChangeNameModal(workout: PostWorkoutBody, slidingItem: IonItemSliding): Promise<void>;

  deleteWorkout(id: string, slidingItem: IonItemSliding): Promise<void>;
};

describe('WorkoutsListComponent', () => {
  let component: WorkoutsListComponent;
  let fixture: ComponentFixture<WorkoutsListComponent>;
  let list: WorkoutsListTestApi;
  let editorState: WorkoutsEditorState;

  const workouts: WorkoutDoc[] = [
    {
      id: 'workout-1',
      userId: 'test-user',
      workoutId: 1,
      listId: 0,
      name: 'Push',
      lastUpdated: 0,
      list: [],
    },
    {
      id: 'workout-2',
      userId: 'test-user',
      workoutId: 2,
      listId: 1,
      name: 'Pull',
      lastUpdated: 0,
      list: [],
    },
  ];

  const resourceValue = signal<WorkoutDoc[] | undefined>(workouts);

  const resourceStatus = signal<'loading' | 'resolved' | 'error'>('resolved');

  const sortedWorkouts = signal<WorkoutDoc[]>(workouts);

  const workoutsServiceMock = {
    workoutsResource: {
      value: resourceValue,
      status: resourceStatus,
    },

    sortedWorkouts,

    changeWorkoutName: vi.fn(() => of(workouts[0])),

    deleteWorkout: vi.fn(() => of([workouts[1]])),
  };

  const ionicUiServiceMock = {
    showError: vi.fn().mockResolvedValue(undefined),
  };

  const modalMock = {
    present: vi.fn().mockResolvedValue(undefined),

    onDidDismiss: vi.fn().mockResolvedValue({
      data: undefined,
    }),
  };

  const modalControllerMock = {
    create: vi.fn().mockResolvedValue(modalMock),
  };

  const loadingMock = {
    present: vi.fn().mockResolvedValue(undefined),
    dismiss: vi.fn().mockResolvedValue(undefined),
  };

  const loadingControllerMock = {
    create: vi.fn().mockResolvedValue(loadingMock),
  };

  function createSlidingItem(): IonItemSliding {
    return {
      close: vi.fn().mockResolvedValue(true),
    } as unknown as IonItemSliding;
  }

  beforeEach(async () => {
    vi.clearAllMocks();

    addIcons({
      'list-outline': listOutline,
    });

    resourceValue.set(workouts);
    resourceStatus.set('resolved');
    sortedWorkouts.set(workouts);

    workoutsServiceMock.changeWorkoutName.mockReturnValue(of(workouts[0]));

    workoutsServiceMock.deleteWorkout.mockReturnValue(of([workouts[1]]));

    modalMock.onDidDismiss.mockResolvedValue({
      data: undefined,
    });

    modalControllerMock.create.mockResolvedValue(modalMock);

    loadingControllerMock.create.mockResolvedValue(loadingMock);

    await TestBed.configureTestingModule({
      imports: [WorkoutsListComponent],
      providers: [
        provideIonicAngular(),
        provideRouter([]),
        provideTestTranslations(),
        WorkoutsEditorState,
        {
          provide: WorkoutsService,
          useValue: workoutsServiceMock,
        },
        {
          provide: IonicUiService,
          useValue: ionicUiServiceMock,
        },
        {
          provide: ModalController,
          useValue: modalControllerMock,
        },
        {
          provide: LoadingController,
          useValue: loadingControllerMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutsListComponent);

    component = fixture.componentInstance;

    list = component as unknown as WorkoutsListTestApi;

    editorState = TestBed.inject(WorkoutsEditorState);

    fixture.detectChanges();
  });

  describe('creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('displayed workouts', () => {
    it('should display the sorted workouts when not editing', () => {
      expect(editorState.isEditing()).toBe(false);

      expect(list.displayedWorkouts()).toEqual(workouts);
    });

    it('should display the editor draft when editing', () => {
      editorState.start(workouts);

      const draft = editorState.draft();

      expect(draft).not.toBeNull();
      expect(list.displayedWorkouts()).toBe(draft);
    });
  });

  describe('resource state', () => {
    it('should detect an initial loading state', () => {
      resourceValue.set(undefined);
      resourceStatus.set('loading');

      expect(list.hasWorkoutsValue()).toBe(false);
      expect(list.isInitialLoading()).toBe(true);
    });

    it('should not detect initial loading when workouts already exist', () => {
      resourceValue.set(workouts);
      resourceStatus.set('loading');

      expect(list.hasWorkoutsValue()).toBe(true);
      expect(list.isInitialLoading()).toBe(false);
    });

    it('should detect an error state', () => {
      resourceStatus.set('error');

      expect(list.hasError()).toBe(true);
    });
  });

  describe('reorder', () => {
    it('should reorder workouts and update their list ids', () => {
      editorState.start(workouts);

      const complete = vi.fn();

      const event = {
        detail: {
          from: 0,
          to: 1,
          complete,
        },
      } as unknown as CustomEvent<ItemReorderEventDetail>;

      list.handleReorder(event);

      expect(editorState.draft()).toEqual([
        {
          ...workouts[1],
          listId: 0,
        },
        {
          ...workouts[0],
          listId: 1,
        },
      ]);

      expect(complete).toHaveBeenCalledOnce();
    });

    it('should complete without changing workouts when not editing', () => {
      const complete = vi.fn();

      const event = {
        detail: {
          from: 0,
          to: 1,
          complete,
        },
      } as unknown as CustomEvent<ItemReorderEventDetail>;

      list.handleReorder(event);

      expect(editorState.draft()).toBeNull();

      expect(complete).toHaveBeenCalledOnce();
    });
  });

  describe('change workout name', () => {
    it('should open the change name modal with the current workout', async () => {
      const slidingItem = createSlidingItem();

      await list.openChangeNameModal(workouts[0], slidingItem);

      expect(slidingItem.close).toHaveBeenCalledOnce();

      expect(modalControllerMock.create).toHaveBeenCalledWith({
        component: TextInputDialog,
        componentProps: {
          title: 'tabs.training.workouts.actions.change-name.title',
          label: 'Name',
          placeholder: 'Name',
          value: 'Push',
          maxLength: WORKOUT_NAME_MAX_LENGTH,
        },
      });

      expect(modalMock.present).toHaveBeenCalledOnce();
    });

    it('should not update the workout when the modal is dismissed without a name', async () => {
      const slidingItem = createSlidingItem();

      modalMock.onDidDismiss.mockResolvedValueOnce({
        data: undefined,
      });

      await list.openChangeNameModal(workouts[0], slidingItem);

      expect(workoutsServiceMock.changeWorkoutName).not.toHaveBeenCalled();

      expect(loadingControllerMock.create).not.toHaveBeenCalled();
    });

    it('should not update the workout when the name only contains whitespace', async () => {
      const slidingItem = createSlidingItem();

      modalMock.onDidDismiss.mockResolvedValueOnce({
        data: '   ',
      });

      await list.openChangeNameModal(workouts[0], slidingItem);

      expect(workoutsServiceMock.changeWorkoutName).not.toHaveBeenCalled();

      expect(loadingControllerMock.create).not.toHaveBeenCalled();
    });

    it('should not update the workout when the name did not change', async () => {
      const slidingItem = createSlidingItem();

      modalMock.onDidDismiss.mockResolvedValueOnce({
        data: 'Push',
      });

      await list.openChangeNameModal(workouts[0], slidingItem);

      expect(workoutsServiceMock.changeWorkoutName).not.toHaveBeenCalled();

      expect(loadingControllerMock.create).not.toHaveBeenCalled();
    });

    it('should trim and update a changed workout name', async () => {
      const slidingItem = createSlidingItem();

      modalMock.onDidDismiss.mockResolvedValueOnce({
        data: '  Push Day  ',
      });

      workoutsServiceMock.changeWorkoutName.mockReturnValueOnce(
        of({
          ...workouts[0],
          name: 'Push Day',
        }),
      );

      await list.openChangeNameModal(workouts[0], slidingItem);

      expect(loadingControllerMock.create).toHaveBeenCalledWith({
        message: 'tabs.training.workouts.actions.change-name.process',
        spinner: 'circles',
      });

      expect(loadingMock.present).toHaveBeenCalledOnce();

      expect(workoutsServiceMock.changeWorkoutName).toHaveBeenCalledWith({
        ...workouts[0],
        name: 'Push Day',
      });

      await vi.waitFor(() => {
        expect(loadingMock.dismiss).toHaveBeenCalledOnce();
      });
    });

    it('should trim, update and apply a changed workout name to the editor draft', async () => {
      editorState.start(workouts);

      const slidingItem = createSlidingItem();

      modalMock.onDidDismiss.mockResolvedValueOnce({
        data: '  Push Day  ',
      });

      const updatedWorkout: WorkoutDoc = {
        ...workouts[0],
        name: 'Push Day',
      };

      workoutsServiceMock.changeWorkoutName.mockReturnValueOnce(of(updatedWorkout));

      await list.openChangeNameModal(workouts[0], slidingItem);

      expect(workoutsServiceMock.changeWorkoutName).toHaveBeenCalledWith({
        ...workouts[0],
        name: 'Push Day',
      });

      expect(editorState.draft()).toEqual([updatedWorkout, workouts[1]]);

      expect(loadingMock.dismiss).toHaveBeenCalledOnce();
    });

    it('should show the duplicate workout error for status 409', async () => {
      const slidingItem = createSlidingItem();

      modalMock.onDidDismiss.mockResolvedValueOnce({
        data: 'Pull',
      });

      workoutsServiceMock.changeWorkoutName.mockReturnValueOnce(
        throwError(() => ({
          status: 409,
        })),
      );

      await list.openChangeNameModal(workouts[0], slidingItem);

      await vi.waitFor(() => {
        expect(loadingMock.dismiss).toHaveBeenCalledOnce();

        expect(ionicUiServiceMock.showError).toHaveBeenCalledWith(
          'tabs.training.workouts.actions.add-workout.already-exists',
        );
      });
    });

    it('should show the change name error when updating fails', async () => {
      const slidingItem = createSlidingItem();

      modalMock.onDidDismiss.mockResolvedValueOnce({
        data: 'Push Day',
      });

      workoutsServiceMock.changeWorkoutName.mockReturnValueOnce(
        throwError(() => new Error('Update failed')),
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await list.openChangeNameModal(workouts[0], slidingItem);

      await vi.waitFor(() => {
        expect(loadingMock.dismiss).toHaveBeenCalledOnce();

        expect(ionicUiServiceMock.showError).toHaveBeenCalledWith(
          'tabs.training.workouts.actions.change-name.error',
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle an error while opening the modal', async () => {
      const slidingItem = createSlidingItem();

      modalControllerMock.create.mockRejectedValueOnce(new Error('Modal failed'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await list.openChangeNameModal(workouts[0], slidingItem);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Change workout name modal could not be opened:',
        expect.any(Error),
      );

      expect(workoutsServiceMock.changeWorkoutName).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('delete workout', () => {
    it('should delete the workout and update the editor draft', async () => {
      editorState.start(workouts);

      const slidingItem = createSlidingItem();

      const remainingWorkouts: WorkoutDoc[] = [
        {
          ...workouts[1],
          listId: 0,
        },
      ];

      workoutsServiceMock.deleteWorkout.mockReturnValueOnce(of(remainingWorkouts));

      await list.deleteWorkout('workout-1', slidingItem);

      expect(slidingItem.close).toHaveBeenCalledOnce();

      expect(loadingControllerMock.create).toHaveBeenCalledWith({
        message: 'tabs.training.workouts.actions.delete.process',
        spinner: 'circles',
      });

      expect(loadingMock.present).toHaveBeenCalledOnce();

      expect(workoutsServiceMock.deleteWorkout).toHaveBeenCalledWith('workout-1');

      expect(editorState.draft()).toEqual(remainingWorkouts);

      expect(loadingMock.dismiss).toHaveBeenCalledOnce();
    });

    it('should show an error when deleting fails', async () => {
      editorState.start(workouts);

      const slidingItem = createSlidingItem();

      workoutsServiceMock.deleteWorkout.mockReturnValueOnce(
        throwError(() => new Error('Delete failed')),
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await list.deleteWorkout('workout-1', slidingItem);

      expect(ionicUiServiceMock.showError).toHaveBeenCalledWith(
        'tabs.training.workouts.actions.delete.error',
      );

      expect(editorState.draft()).toEqual(workouts);

      expect(loadingMock.dismiss).toHaveBeenCalledOnce();

      consoleErrorSpy.mockRestore();
    });
  });
});
