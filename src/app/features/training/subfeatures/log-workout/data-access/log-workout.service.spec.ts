import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  UserService,
  type ExerciseWorkoutHistoryDTO,
  type GetLogWorkoutDTO,
  type WorkoutSet,
} from '../../../../../core';
import { IonicUiService } from '../../../../../shared';

import { LogWorkoutService } from './log-workout.service';

const createWorkoutSet = (overrides: Partial<WorkoutSet> = {}): WorkoutSet => ({
  load: 80,
  reps: 10,
  exercise: 'Bench Press',
  itemId: 1,
  note: null,
  time: '19:23:45',
  ...overrides,
});

const createLogWorkout = (overrides: Partial<GetLogWorkoutDTO> = {}): GetLogWorkoutDTO => ({
  id: 'log-doc-id',
  date: 1_700_000_000,
  userId: 'user-1',
  logId: 42,
  sets: [createWorkoutSet()],
  ...overrides,
});

describe('LogWorkoutService', () => {
  let service: LogWorkoutService;

  const httpMock = {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  };

  const userServiceMock = {
    userData: vi.fn(),
  };

  const ionicUiServiceMock = {
    showError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    userServiceMock.userData.mockReturnValue(undefined);
    ionicUiServiceMock.showError.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        LogWorkoutService,
        {
          provide: HttpClient,
          useValue: httpMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: IonicUiService,
          useValue: ionicUiServiceMock,
        },
      ],
    });

    service = TestBed.inject(LogWorkoutService);
  });

  describe('logId', () => {
    it('should return log id from log workout resource', () => {
      service.logWorkoutResource.set(
        createLogWorkout({
          logId: 123,
        }),
      );

      expect(service.logId()).toBe(123);
    });

    it('should return undefined when no log workout exists', () => {
      service.logWorkoutResource.set(undefined);

      expect(service.logId()).toBeUndefined();
    });
  });

  describe('addLogWorkout', () => {
    it('should add set and update log workout resource', async () => {
      const set = createWorkoutSet();
      const response = createLogWorkout();

      httpMock.post.mockReturnValue(of(response));

      const result = await firstValueFrom(service.addLogWorkout(1_700_000_000, set, 'user-1'));

      expect(httpMock.post).toHaveBeenCalledWith(
        expect.stringContaining('/logs-workout/add/set/1700000000/user-1'),
        set,
      );

      expect(result).toBe(response);
      expect(service.logWorkoutResource.value()).toBe(response);
    });
  });

  describe('deleteSet', () => {
    it('should delete set and update log workout resource', async () => {
      const set = createWorkoutSet({
        itemId: 12,
      });

      const response = createLogWorkout({
        sets: [],
      });

      httpMock.delete.mockReturnValue(of(response));

      const result = await firstValueFrom(service.deleteSet('42', 12, set));

      expect(httpMock.delete).toHaveBeenCalledWith(
        expect.stringContaining('/logs-workout/delete/42/12'),
        {
          body: set,
        },
      );

      expect(result).toBe(response);
      expect(service.logWorkoutResource.value()).toBe(response);
    });

    it('should clear log workout resource when backend returns undefined', async () => {
      const set = createWorkoutSet();

      httpMock.delete.mockReturnValue(of(undefined));

      const result = await firstValueFrom(service.deleteSet('42', set.itemId, set));

      expect(result).toBeUndefined();
      expect(service.logWorkoutResource.value()).toBeUndefined();
    });
  });

  describe('deleteSets', () => {
    it('should delete sets sequentially and return last response', async () => {
      const firstSet = createWorkoutSet({
        itemId: 1,
      });

      const secondSet = createWorkoutSet({
        itemId: 2,
      });

      const firstResponse = createLogWorkout({
        sets: [secondSet],
      });

      const secondResponse = createLogWorkout({
        sets: [],
      });

      const deleteSetSpy = vi
        .spyOn(service, 'deleteSet')
        .mockReturnValueOnce(of(firstResponse))
        .mockReturnValueOnce(of(secondResponse));

      const result = await firstValueFrom(service.deleteSets('42', [firstSet, secondSet]));

      expect(deleteSetSpy).toHaveBeenNthCalledWith(1, '42', firstSet.itemId, firstSet);

      expect(deleteSetSpy).toHaveBeenNthCalledWith(2, '42', secondSet.itemId, secondSet);

      expect(result).toBe(secondResponse);
    });
  });

  describe('loadMoreExerciseHistory', () => {
    it('should return undefined when exercise is missing', () => {
      userServiceMock.userData.mockReturnValue({
        id: 'user-1',
      });

      service.exercise.set(null);

      expect(service.loadMoreExerciseHistory()).toBeUndefined();
      expect(httpMock.get).not.toHaveBeenCalled();
    });

    it('should return undefined when user is missing', () => {
      service.exercise.set('Bench Press');

      userServiceMock.userData.mockReturnValue(undefined);

      expect(service.loadMoreExerciseHistory()).toBeUndefined();
      expect(httpMock.get).not.toHaveBeenCalled();
    });

    it('should return undefined when history has no more workouts', () => {
      userServiceMock.userData.mockReturnValue({
        id: 'user-1',
      });

      service.exercise.set('Bench Press');

      service.exerciseHistoryResource.set({
        workouts: [createLogWorkout()],
        hasMore: false,
      });

      expect(service.loadMoreExerciseHistory()).toBeUndefined();
      expect(httpMock.get).not.toHaveBeenCalled();
    });

    it('should return undefined when history has no workouts', () => {
      userServiceMock.userData.mockReturnValue({
        id: 'user-1',
      });

      service.exercise.set('Bench Press');

      service.exerciseHistoryResource.set({
        workouts: [],
        hasMore: true,
      });

      expect(service.loadMoreExerciseHistory()).toBeUndefined();
      expect(httpMock.get).not.toHaveBeenCalled();
    });

    it('should load and append more exercise history', async () => {
      const newestWorkout = createLogWorkout({
        id: 'newest',
        date: 1_700_000_000,
        logId: 3,
      });

      const oldestWorkout = createLogWorkout({
        id: 'oldest',
        date: 1_600_000_000,
        logId: 2,
      });

      const olderWorkout = createLogWorkout({
        id: 'older',
        date: 1_500_000_000,
        logId: 1,
      });

      const currentHistory: ExerciseWorkoutHistoryDTO = {
        workouts: [newestWorkout, oldestWorkout],
        hasMore: true,
      };

      const response: ExerciseWorkoutHistoryDTO = {
        workouts: [olderWorkout],
        hasMore: false,
      };

      userServiceMock.userData.mockReturnValue({
        id: 'user-1',
      });

      service.exercise.set('Bench Press');
      service.exerciseHistoryResource.set(currentHistory);

      httpMock.get.mockReturnValue(of(response));

      const request = service.loadMoreExerciseHistory();

      expect(request).toBeDefined();

      const result = await firstValueFrom(request!);

      expect(httpMock.get).toHaveBeenCalledWith(
        expect.stringContaining('/logs-workout/get/exercise-history/user-1'),
        {
          params: {
            exercise: 'Bench Press',
            before: oldestWorkout.date,
            limit: 1,
          },
        },
      );

      expect(result).toBe(response);

      expect(service.exerciseHistoryResource.value()).toEqual({
        workouts: [newestWorkout, oldestWorkout, olderWorkout],
        hasMore: false,
      });
    });
  });

  describe('appendExerciseHistory', () => {
    it('should initialize history when no current history exists', () => {
      const response: ExerciseWorkoutHistoryDTO = {
        workouts: [createLogWorkout()],
        hasMore: true,
      };

      service.exerciseHistoryResource.set(undefined);

      service.appendExerciseHistory(response);

      expect(service.exerciseHistoryResource.value()).toEqual(response);
    });

    it('should append workouts to existing history', () => {
      const currentWorkout = createLogWorkout({
        id: 'current',
        logId: 2,
      });

      const olderWorkout = createLogWorkout({
        id: 'older',
        logId: 1,
      });

      service.exerciseHistoryResource.set({
        workouts: [currentWorkout],
        hasMore: true,
      });

      service.appendExerciseHistory({
        workouts: [olderWorkout],
        hasMore: false,
      });

      expect(service.exerciseHistoryResource.value()).toEqual({
        workouts: [currentWorkout, olderWorkout],
        hasMore: false,
      });
    });
  });
});
