import { signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  IonList,
  LoadingController,
  provideIonicAngular,
  type RefresherCustomEvent,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, chevronDown, ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { provideTestTranslations } from '../../../../testing/translate-testing.provider';
import type { WorkoutDoc } from '../../../core';
import { UserService } from '../../../core';
import { IonicUiService } from '../../../shared';

import { WorkoutsService } from '../data-access';

import { WorkoutsListComponent } from './components';
import { WorkoutsEditorState } from './workouts-editor.state';
import { WorkoutsPage } from './workouts.page';

type WorkoutsPageTestApi = {
  handleRefresh(event: RefresherCustomEvent): void;
  startEditing(): Promise<void>;
  abortEditing(): Promise<void>;
  saveEdit(): Promise<void>;
};

type TestUser = {
  id: string;
};

describe('WorkoutsPage', () => {
  let component: WorkoutsPage;
  let fixture: ComponentFixture<WorkoutsPage>;
  let page: WorkoutsPageTestApi;
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

  const userData = signal<TestUser | undefined>({
    id: 'test-user',
  });

  const resourceValue = signal<WorkoutDoc[] | undefined>(workouts);
  const resourceLoading = signal(false);
  const resourceStatus = signal<'loading' | 'resolved' | 'error'>('resolved');

  const workoutsServiceMock = {
    workoutsResource: {
      value: resourceValue,
      reload: vi.fn(() => true),
      isLoading: resourceLoading,
      status: resourceStatus,
    },

    sortedWorkouts: signal<WorkoutDoc[]>(workouts),

    updateAllWorkouts: vi.fn(() => of(workouts)),
    changeWorkoutName: vi.fn(),
    deleteWorkout: vi.fn(),
  };

  const userServiceMock = {
    userData,
  };

  const ionicUiServiceMock = {
    closeSlidingItems: vi.fn().mockResolvedValue(undefined),
    showError: vi.fn().mockResolvedValue(undefined),
  };

  const loadingMock = {
    present: vi.fn().mockResolvedValue(undefined),
    dismiss: vi.fn().mockResolvedValue(undefined),
  };

  const loadingControllerMock = {
    create: vi.fn().mockResolvedValue(loadingMock),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    addIcons({
      'ellipsis-vertical': ellipsisVertical,
      'ellipsis-horizontal': ellipsisHorizontal,
      'chevron-down': chevronDown,
      add,
    });

    userData.set({
      id: 'test-user',
    });

    resourceValue.set(workouts);
    resourceLoading.set(false);
    resourceStatus.set('resolved');

    workoutsServiceMock.sortedWorkouts.set(workouts);
    workoutsServiceMock.workoutsResource.reload.mockReturnValue(true);
    workoutsServiceMock.updateAllWorkouts.mockReturnValue(of(workouts));

    await TestBed.configureTestingModule({
      imports: [WorkoutsPage],
      providers: [
        provideIonicAngular(),
        provideTestTranslations(),
        {
          provide: IonicUiService,
          useValue: ionicUiServiceMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: WorkoutsService,
          useValue: workoutsServiceMock,
        },
        {
          provide: LoadingController,
          useValue: loadingControllerMock,
        },
      ],
    })
      .overrideComponent(WorkoutsPage, {
        set: {
          template: `
            <app-workouts-list #workoutsComp />
            <ion-popover #moreMenu />
          `,
        },
      })
      .overrideComponent(WorkoutsListComponent, {
        set: {
          imports: [IonList],
          template: `<ion-list />`,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkoutsPage);
    component = fixture.componentInstance;

    page = component as unknown as WorkoutsPageTestApi;

    editorState = fixture.componentRef.injector.get(WorkoutsEditorState);

    fixture.detectChanges();
  });

  describe('creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('editing', () => {
    it('should start editing with the current workouts', async () => {
      const popover = fixture.nativeElement.querySelector('ion-popover') as HTMLIonPopoverElement;

      const dismissSpy = vi.spyOn(popover, 'dismiss').mockResolvedValue(true);

      await page.startEditing();

      expect(editorState.isEditing()).toBe(true);
      expect(editorState.draft()).toEqual(workouts);

      expect(editorState.draft()).not.toBe(workouts);

      expect(dismissSpy).toHaveBeenCalledOnce();
    });

    it('should cancel editing', async () => {
      editorState.start(workouts);

      const listComponent = fixture.debugElement.query(By.directive(WorkoutsListComponent))
        .componentInstance as WorkoutsListComponent;

      const closeSlidingItemsSpy = vi
        .spyOn(listComponent.workoutsList(), 'closeSlidingItems')
        .mockResolvedValue(true);

      await page.abortEditing();

      expect(closeSlidingItemsSpy).toHaveBeenCalledOnce();
      expect(ionicUiServiceMock.closeSlidingItems).toHaveBeenCalledOnce();

      expect(editorState.isEditing()).toBe(false);
      expect(editorState.draft()).toBeNull();
    });
  });

  describe('saving', () => {
    it('should save the draft and finish editing', async () => {
      editorState.start(workouts);

      const listComponent = fixture.debugElement.query(By.directive(WorkoutsListComponent))
        .componentInstance as WorkoutsListComponent;

      vi.spyOn(listComponent.workoutsList(), 'closeSlidingItems').mockResolvedValue(true);

      await page.saveEdit();

      expect(loadingControllerMock.create).toHaveBeenCalledWith({
        message: 'tabs.training.workouts.actions.update-list.process',
        spinner: 'circles',
      });

      expect(loadingMock.present).toHaveBeenCalledOnce();

      expect(workoutsServiceMock.updateAllWorkouts).toHaveBeenCalledWith('test-user', workouts);

      await vi.waitFor(() => {
        expect(loadingMock.dismiss).toHaveBeenCalledOnce();
        expect(editorState.draft()).toBeNull();
        expect(editorState.isEditing()).toBe(false);
      });
    });

    it('should keep the draft when saving fails', async () => {
      editorState.start(workouts);

      workoutsServiceMock.updateAllWorkouts.mockReturnValueOnce(
        throwError(() => new Error('Update failed')),
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await page.saveEdit();

      await vi.waitFor(() => {
        expect(loadingMock.dismiss).toHaveBeenCalledOnce();

        expect(ionicUiServiceMock.showError).toHaveBeenCalledWith(
          'tabs.training.workouts.actions.update-list.error',
        );
      });

      expect(editorState.isEditing()).toBe(true);
      expect(editorState.draft()).toEqual(workouts);

      consoleErrorSpy.mockRestore();
    });

    it('should not save without a draft', async () => {
      await page.saveEdit();

      expect(workoutsServiceMock.updateAllWorkouts).not.toHaveBeenCalled();
      expect(loadingControllerMock.create).not.toHaveBeenCalled();
    });

    it('should not save without a user', async () => {
      editorState.start(workouts);
      userData.set(undefined);

      await page.saveEdit();

      expect(workoutsServiceMock.updateAllWorkouts).not.toHaveBeenCalled();
      expect(loadingControllerMock.create).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should complete immediately when reload does not start', () => {
      workoutsServiceMock.workoutsResource.reload.mockReturnValueOnce(false);
      resourceLoading.set(false);

      const complete = vi.fn();

      const event = {
        target: {
          complete,
        },
      } as unknown as RefresherCustomEvent;

      page.handleRefresh(event);

      expect(complete).toHaveBeenCalledOnce();
    });
  });
});
