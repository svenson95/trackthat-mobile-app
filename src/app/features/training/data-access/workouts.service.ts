import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { map, tap, type Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.prod';
import type {
  DeleteWorkoutResponse,
  DeleteWorkoutResult,
  GetWorkoutsResponse,
  PostWorkoutBody,
  PostWorkoutResponse,
  PutWorkoutBody,
  PutWorkoutResponse,
  PutWorkoutsBody,
  PutWorkoutsResponse,
  UserId,
  Workout,
  WorkoutId,
  WorkoutList,
} from '../../../core';
import { UserService } from '../../../core';

@Injectable()
export class WorkoutsService {
  private readonly apiUrl = environment.api + 'workouts';

  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  readonly workoutsResource = httpResource<GetWorkoutsResponse>(() => {
    const userId = this.userService.userData()?.id;

    if (!userId) {
      return undefined;
    }

    return {
      url: `${this.apiUrl}/get/${userId}`,
      method: 'GET',
    };
  });

  readonly sortedWorkouts = computed(() => {
    const workouts = this.workoutsResource.value() ?? [];

    return [...workouts].sort((a, b) => a.listId - b.listId);
  });

  addWorkout(workout: PostWorkoutBody): Observable<PostWorkoutResponse> {
    return this.http.post<PostWorkoutResponse>(`${this.apiUrl}/add`, workout).pipe(
      tap((createdWorkout) => {
        const workouts = this.workoutsResource.value() ?? [];

        this.workoutsResource.set([...workouts, createdWorkout]);
      }),
    );
  }

  changeWorkoutName(workout: PostWorkoutBody): Observable<PostWorkoutResponse> {
    return this.http.post<PostWorkoutResponse>(`${this.apiUrl}/change-name`, workout).pipe(
      tap((updatedWorkout) => {
        const workouts = this.workoutsResource.value() ?? [];

        this.workoutsResource.set(
          workouts.map((currentWorkout) =>
            currentWorkout.workoutId === updatedWorkout.workoutId ? updatedWorkout : currentWorkout,
          ),
        );
      }),
    );
  }

  updateWorkoutList(workout: PutWorkoutBody): Observable<PutWorkoutResponse> {
    return this.http.post<PutWorkoutResponse>(`${this.apiUrl}/change-list`, workout).pipe(
      tap((updatedWorkout) => {
        const workouts = this.workoutsResource.value() ?? [];

        this.workoutsResource.set(
          workouts.map((currentWorkout) =>
            currentWorkout.workoutId === updatedWorkout.workoutId ? updatedWorkout : currentWorkout,
          ),
        );
      }),
    );
  }

  updateAllWorkouts(userId: UserId, workouts: PutWorkoutsBody): Observable<PutWorkoutsResponse> {
    return this.http
      .post<PutWorkoutsResponse>(`${this.apiUrl}/update-all/${userId}`, workouts)
      .pipe(
        tap((updatedWorkouts) => {
          this.workoutsResource.set(updatedWorkouts);
        }),
      );
  }

  deleteWorkout(id: WorkoutId): Observable<DeleteWorkoutResult> {
    return this.http.delete<DeleteWorkoutResponse>(`${this.apiUrl}/delete/${id}`).pipe(
      map(() => {
        const workouts = this.workoutsResource.value() ?? [];
        return workouts.filter((workout) => workout.id !== id);
      }),
      tap((workouts) => {
        this.workoutsResource.set(workouts);
      }),
    );
  }

  initWorkout(name: string, list: WorkoutList): Workout {
    const workouts = this.workoutsResource.value() ?? [];
    const workoutIds = workouts.map((workout) => workout.workoutId);
    const listIds = workouts.map((workout) => workout.listId);

    const user = this.userService.userData();

    if (!user) {
      throw new Error('No user found during initWorkout');
    }

    return {
      userId: user.id,
      workoutId: workoutIds.length === 0 ? 1 : Math.max(...workoutIds) + 1,
      listId: listIds.length === 0 ? 1 : Math.max(...listIds) + 1,
      lastUpdated: Date.now(),
      name,
      list,
    };
  }
}
