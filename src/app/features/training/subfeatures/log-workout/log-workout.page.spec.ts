import { Location } from '@angular/common';
import { signal, type Signal, type WritableSignal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { LoadingController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TranslateService } from '@ngx-translate/core';

import type { LogWorkoutDoc, WorkoutSet } from '../../../../core';
import { IonicUiService } from '../../../../shared';

import { WorkoutsService } from '../../data-access';

import { LogWorkoutService } from './data-access';
import { LogWorkoutPage } from './log-workout.page';
import { LogWorkoutEditorState } from './state';

type LogWorkoutPageTestApi = {
  readonly backButtonText: Signal<string>;
  readonly isMoreMenuOpen: WritableSignal<boolean>;

  startEditing(): Promise<void>;
  presentPopover(event: Event): void;
  abortEditing(): Promise<void>;
  saveEditing(): Promise<void>;
};

const createWorkoutSet = (overrides: Partial<WorkoutSet> = {}): WorkoutSet => ({
  load: 80,
  reps: 10,
  exercise: 'Bench Press',
  itemId: 1,
  note: null,
  time: '19:23:45',
  ...overrides,
});

const createLogWorkout = (overrides: Partial<LogWorkoutDoc> = {}): LogWorkoutDoc => ({
  id: 'mongo-id',
  userId: 'user-id',
  logId: 123,
  date: 1_758_484_800,
  sets: [],
  ...overrides,
});

describe('LogWorkoutPage', () => {
  let fixture: ComponentFixture<LogWorkoutPage>;
  let page: LogWorkoutPageTestApi;
  let moreMenu: HTMLIonPopoverElement;

  const logId = signal<number | undefined>(undefined);
  const exercise = signal<string | null>(null);
  const logWorkout = signal<LogWorkoutDoc | undefined>(undefined);

  const sortedWorkouts = signal<
    Array<{
      workoutId: number;
      name: string;
    }>
  >([]);

  const isEditing = signal(false);
  const hasChanges = signal(false);
  const draftSets = signal<WorkoutSet[]>([]);

  const logWorkoutServiceMock = {
    logId,
    exercise,
    logWorkoutResource: {
      value: logWorkout,
    },
    updateSets: vi.fn(),
  };

  const workoutsServiceMock = {
    sortedWorkouts,
  };

  const editorStateMock = {
    isEditing,
    hasChanges,
    draftSets,
    start: vi.fn(),
    cancel: vi.fn(),
    finish: vi.fn(),
  };

  const ionicUiServiceMock = {
    closeSlidingItems: vi.fn().mockResolvedValue(undefined),
    showError: vi.fn().mockResolvedValue(undefined),
  };

  const locationMock = {
    path: vi.fn().mockReturnValue(''),
    replaceState: vi.fn(),
  };

  const loadingMock = {
    present: vi.fn().mockResolvedValue(undefined),
    dismiss: vi.fn().mockResolvedValue(undefined),
  };

  const loadingControllerMock = {
    create: vi.fn().mockResolvedValue(loadingMock),
  };

  const translateServiceMock = {
    instant: vi.fn((key: string) => key),
  };

  const setRouteInputs = (workoutId = '1', itemId = '2', exercise = 'Bench Press'): void => {
    fixture.componentRef.setInput('workoutId', workoutId);
    fixture.componentRef.setInput('itemId', itemId);
    fixture.componentRef.setInput('exercise', exercise);

    fixture.detectChanges();
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    logId.set(undefined);
    exercise.set(null);
    logWorkout.set(undefined);
    sortedWorkouts.set([]);

    isEditing.set(false);
    hasChanges.set(false);
    draftSets.set([]);

    locationMock.path.mockReturnValue('');

    await TestBed.configureTestingModule({
      imports: [LogWorkoutPage],
      providers: [
        {
          provide: LogWorkoutService,
          useValue: logWorkoutServiceMock,
        },
        {
          provide: WorkoutsService,
          useValue: workoutsServiceMock,
        },
        {
          provide: IonicUiService,
          useValue: ionicUiServiceMock,
        },
        {
          provide: Location,
          useValue: locationMock,
        },
        {
          provide: LoadingController,
          useValue: loadingControllerMock,
        },
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
      ],
    })
      .overrideComponent(LogWorkoutPage, {
        set: {
          template: '<ion-popover #moreMenu />',
          providers: [
            {
              provide: LogWorkoutEditorState,
              useValue: editorStateMock,
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LogWorkoutPage);

    page = fixture.componentInstance as unknown as LogWorkoutPageTestApi;

    fixture.detectChanges();

    moreMenu = fixture.nativeElement.querySelector('ion-popover') as HTMLIonPopoverElement;
  });

  describe('backButtonText', () => {
    it('should return workout name', () => {
      sortedWorkouts.set([
        {
          workoutId: 42,
          name: 'Push Day',
        },
      ]);

      fixture.componentRef.setInput('workoutId', '42');

      expect(page.backButtonText()).toBe('Push Day');
    });

    it('should truncate workout name longer than 12 characters', () => {
      sortedWorkouts.set([
        {
          workoutId: 42,
          name: 'Upper Body Workout',
        },
      ]);

      fixture.componentRef.setInput('workoutId', '42');

      expect(page.backButtonText()).toBe('Upper Body...');
    });

    it('should return empty string when workout does not exist', () => {
      fixture.componentRef.setInput('workoutId', '42');

      expect(page.backButtonText()).toBe('');
    });
  });

  describe('route synchronization', () => {
    it('should synchronize route without log id', () => {
      setRouteInputs();

      expect(locationMock.replaceState).toHaveBeenCalledWith(
        '/tabs/training/1/2/Bench%20Press/log',
      );
    });

    it('should synchronize route with log id', () => {
      logId.set(123);

      setRouteInputs();

      expect(locationMock.replaceState).toHaveBeenCalledWith(
        '/tabs/training/1/2/Bench%20Press/log/123',
      );
    });

    it('should not replace route when current route already matches target', () => {
      locationMock.path.mockReturnValue('/tabs/training/1/2/Bench%20Press/log/123');

      logId.set(123);

      setRouteInputs();

      expect(locationMock.replaceState).not.toHaveBeenCalled();
    });

    it('should encode exercise as route segment', () => {
      setRouteInputs('1', '2', 'Push / Press');

      expect(locationMock.replaceState).toHaveBeenCalledWith(
        '/tabs/training/1/2/Push%20%2F%20Press/log',
      );
    });

    it('should not synchronize route when required inputs are missing', () => {
      fixture.componentRef.setInput('workoutId', '1');

      fixture.detectChanges();

      expect(locationMock.replaceState).not.toHaveBeenCalled();
    });
  });

  describe('exercise synchronization', () => {
    it('should synchronize exercise with service', () => {
      fixture.componentRef.setInput('exercise', 'Bench Press');

      fixture.detectChanges();

      expect(exercise()).toBe('Bench Press');
    });

    it('should not update service when exercise is undefined', () => {
      exercise.set('Squat');

      fixture.componentRef.setInput('exercise', undefined);

      fixture.detectChanges();

      expect(exercise()).toBe('Squat');
    });
  });

  describe('editing', () => {
    it('should start editing with current sets and dismiss more menu', async () => {
      const sets = [
        createWorkoutSet({
          itemId: 1,
        }),
        createWorkoutSet({
          itemId: 2,
        }),
      ];

      logWorkout.set(
        createLogWorkout({
          sets,
        }),
      );

      const dismissSpy = vi.spyOn(moreMenu, 'dismiss').mockResolvedValue(true);

      await page.startEditing();

      expect(editorStateMock.start).toHaveBeenCalledWith(sets);
      expect(dismissSpy).toHaveBeenCalledOnce();
    });

    it('should start editing with empty sets when no log exists', async () => {
      const dismissSpy = vi.spyOn(moreMenu, 'dismiss').mockResolvedValue(true);

      await page.startEditing();

      expect(editorStateMock.start).toHaveBeenCalledWith([]);
      expect(dismissSpy).toHaveBeenCalledOnce();
    });

    it('should abort editing after closing sliding items', async () => {
      await page.abortEditing();

      expect(ionicUiServiceMock.closeSlidingItems).toHaveBeenCalledOnce();
      expect(editorStateMock.cancel).toHaveBeenCalledOnce();
    });
  });

  describe('popover', () => {
    it('should open popover with trigger event', () => {
      const event = new Event('click');

      page.presentPopover(event);

      expect(moreMenu.event).toBe(event);
      expect(page.isMoreMenuOpen()).toBe(true);
    });
  });

  describe('saveEditing', () => {
    it('should finish editing immediately when nothing changed', async () => {
      hasChanges.set(false);

      await page.saveEditing();

      expect(editorStateMock.finish).toHaveBeenCalledOnce();

      expect(logWorkoutServiceMock.updateSets).not.toHaveBeenCalled();
      expect(loadingControllerMock.create).not.toHaveBeenCalled();
    });

    it('should not save when log id is undefined', async () => {
      hasChanges.set(true);
      draftSets.set([createWorkoutSet()]);
      logId.set(undefined);

      await page.saveEditing();

      expect(logWorkoutServiceMock.updateSets).not.toHaveBeenCalled();
      expect(editorStateMock.finish).not.toHaveBeenCalled();
      expect(loadingControllerMock.create).not.toHaveBeenCalled();
    });

    it('should update draft sets and finish editing', async () => {
      const sets = [
        createWorkoutSet({
          itemId: 1,
        }),
        createWorkoutSet({
          itemId: 2,
          load: 85,
        }),
      ];

      hasChanges.set(true);
      draftSets.set(sets);
      logId.set(123);

      logWorkoutServiceMock.updateSets.mockReturnValue(of(undefined));

      await page.saveEditing();

      expect(translateServiceMock.instant).toHaveBeenCalledWith(
        'tabs.training.log-workout.actions.update-sets.process',
      );

      expect(loadingControllerMock.create).toHaveBeenCalledWith({
        message: 'tabs.training.log-workout.actions.update-sets.process',
        spinner: 'circles',
      });

      expect(loadingMock.present).toHaveBeenCalledOnce();

      expect(logWorkoutServiceMock.updateSets).toHaveBeenCalledWith('123', sets);

      expect(editorStateMock.finish).toHaveBeenCalledOnce();
      expect(loadingMock.dismiss).toHaveBeenCalledOnce();

      expect(ionicUiServiceMock.showError).not.toHaveBeenCalled();
    });

    it('should update with empty draft when all sets were deleted', async () => {
      hasChanges.set(true);
      draftSets.set([]);
      logId.set(123);

      logWorkoutServiceMock.updateSets.mockReturnValue(of(undefined));

      await page.saveEditing();

      expect(logWorkoutServiceMock.updateSets).toHaveBeenCalledWith('123', []);

      expect(editorStateMock.finish).toHaveBeenCalledOnce();
      expect(loadingMock.dismiss).toHaveBeenCalledOnce();
    });

    it('should show error and keep editing when updating sets fails', async () => {
      const error = new Error('Request failed');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      hasChanges.set(true);
      draftSets.set([createWorkoutSet()]);
      logId.set(123);

      logWorkoutServiceMock.updateSets.mockReturnValue(throwError(() => error));

      await page.saveEditing();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Could not save log workout changes', error);

      expect(ionicUiServiceMock.showError).toHaveBeenCalledWith(
        'tabs.training.log-workout.actions.update-sets.error',
      );

      expect(editorStateMock.finish).not.toHaveBeenCalled();

      expect(loadingMock.dismiss).toHaveBeenCalledOnce();

      consoleErrorSpy.mockRestore();
    });
  });
});
