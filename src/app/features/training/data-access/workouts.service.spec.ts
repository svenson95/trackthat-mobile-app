import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../../environments/environment.prod';
import type { PostWorkoutBody, PutWorkoutBody, PutWorkoutsBody, WorkoutDoc } from '../../../core';
import { UserService } from '../../../core';

import { WorkoutsService } from './workouts.service';

describe('WorkoutsService', () => {
  const apiUrl = environment.api + 'workouts';

  const userData = signal<{ id: number } | undefined>(undefined);

  const userServiceMock = {
    userData,
  };

  const workout1: WorkoutDoc = {
    id: 'mongo-id-1',
    userId: '1',
    workoutId: 1,
    listId: 2,
    lastUpdated: 1_000,
    name: 'Push',
    list: [],
  };

  const workout2: WorkoutDoc = {
    id: 'mongo-id-2',
    userId: '1',
    workoutId: 2,
    listId: 1,
    lastUpdated: 2_000,
    name: 'Pull',
    list: [],
  };

  let service: WorkoutsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    userData.set(undefined);

    TestBed.configureTestingModule({
      providers: [
        WorkoutsService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    });

    service = TestBed.inject(WorkoutsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.restoreAllMocks();
  });

  describe('workoutsResource', () => {
    it('should not request workouts when no user is available', () => {
      httpTesting.expectNone(`${apiUrl}/get/1`);
    });

    it('should load workouts for the current user', async () => {
      userData.set({ id: 1 });

      TestBed.tick();

      const request = httpTesting.expectOne(`${apiUrl}/get/1`);

      expect(request.request.method).toBe('GET');

      request.flush([workout1, workout2]);

      await TestBed.inject(ApplicationRef).whenStable();

      expect(service.workoutsResource.value()).toEqual([workout1, workout2]);
    });
  });

  describe('sortedWorkouts', () => {
    it('should sort workouts by listId', () => {
      service.workoutsResource.set([workout1, workout2]);

      expect(service.sortedWorkouts()).toEqual([workout2, workout1]);
    });

    it('should return an empty array when no workouts exist', () => {
      service.workoutsResource.set([]);

      expect(service.sortedWorkouts()).toEqual([]);
    });

    it('should not mutate the original workout order', () => {
      service.workoutsResource.set([workout1, workout2]);

      service.sortedWorkouts();

      expect(service.workoutsResource.value()).toEqual([workout1, workout2]);
    });
  });

  describe('addWorkout', () => {
    it('should send the workout and add the created workout to the resource', () => {
      service.workoutsResource.set([workout1]);

      const body: PostWorkoutBody = {
        userId: '1',
        workoutId: 2,
        listId: 1,
        lastUpdated: 2_000,
        name: 'Pull',
        list: [],
      };

      service.addWorkout(body).subscribe((result) => {
        expect(result).toEqual(workout2);
      });

      const request = httpTesting.expectOne(`${apiUrl}/add`);

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(body);

      request.flush(workout2);

      expect(service.workoutsResource.value()).toEqual([workout1, workout2]);
    });
  });

  describe('changeWorkoutName', () => {
    it('should send the workout and replace the updated workout in the resource', () => {
      service.workoutsResource.set([workout1, workout2]);

      const body: PostWorkoutBody = {
        ...workout1,
        name: 'Updated Push',
      };

      const updatedWorkout: WorkoutDoc = {
        ...workout1,
        name: 'Updated Push',
      };

      service.changeWorkoutName(body).subscribe((result) => {
        expect(result).toEqual(updatedWorkout);
      });

      const request = httpTesting.expectOne(`${apiUrl}/change-name`);

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(body);

      request.flush(updatedWorkout);

      expect(service.workoutsResource.value()).toEqual([updatedWorkout, workout2]);
    });
  });

  describe('updateWorkoutList', () => {
    it('should send the workout and replace the updated workout in the resource', () => {
      service.workoutsResource.set([workout1, workout2]);

      const body: PutWorkoutBody = {
        ...workout1,
        list: [
          {
            type: 'HEADER',
            itemId: 1,
            listId: 1,
            name: 'Chest',
          },
        ],
      };

      const updatedWorkout: WorkoutDoc = {
        ...workout1,
        list: body.list,
      };

      service.updateWorkoutList(body).subscribe((result) => {
        expect(result).toEqual(updatedWorkout);
      });

      const request = httpTesting.expectOne(`${apiUrl}/change-list`);

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(body);

      request.flush(updatedWorkout);

      expect(service.workoutsResource.value()).toEqual([updatedWorkout, workout2]);
    });
  });

  describe('updateAllWorkouts', () => {
    it('should send and replace all workouts', () => {
      service.workoutsResource.set([workout1]);

      const body: PutWorkoutsBody = [workout1, workout2];

      service.updateAllWorkouts('1', body).subscribe((result) => {
        expect(result).toEqual([workout1, workout2]);
      });

      const request = httpTesting.expectOne(`${apiUrl}/update-all/1`);

      expect(request.request.method).toBe('POST');
      expect(request.request.body).toEqual(body);

      request.flush([workout1, workout2]);

      expect(service.workoutsResource.value()).toEqual([workout1, workout2]);
    });
  });

  describe('deleteWorkout', () => {
    it('should delete the workout and remove it from the resource', () => {
      service.workoutsResource.set([workout1, workout2]);

      service.deleteWorkout(workout1.id).subscribe((result) => {
        expect(result).toEqual([workout2]);
      });

      const request = httpTesting.expectOne(`${apiUrl}/delete/${workout1.id}`);

      expect(request.request.method).toBe('DELETE');

      request.flush(null);

      expect(service.workoutsResource.value()).toEqual([workout2]);
    });
  });

  describe('initWorkout', () => {
    it('should initialize the first workout', () => {
      userData.set({ id: 42 });
      service.workoutsResource.set([]);

      vi.spyOn(Date, 'now').mockReturnValue(123_456);

      expect(service.initWorkout('Push', [])).toEqual({
        userId: 42,
        workoutId: 1,
        listId: 1,
        lastUpdated: 123_456,
        name: 'Push',
        list: [],
      });
    });

    it('should increment the highest workoutId and listId', () => {
      userData.set({ id: 1 });

      service.workoutsResource.set([
        {
          ...workout1,
          workoutId: 3,
          listId: 7,
        },
        {
          ...workout2,
          workoutId: 8,
          listId: 4,
        },
      ]);

      vi.spyOn(Date, 'now').mockReturnValue(123_456);

      expect(service.initWorkout('Legs', [])).toEqual({
        userId: 1,
        workoutId: 9,
        listId: 8,
        lastUpdated: 123_456,
        name: 'Legs',
        list: [],
      });
    });

    it('should throw when no user is available', () => {
      userData.set(undefined);

      expect(() => service.initWorkout('Push', [])).toThrowError(
        'No user found during initWorkout',
      );
    });
  });
});
