import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { map, tap, type Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.prod';
import type {
  GetWorkoutsDTO,
  ListItem,
  PostWorkoutBody,
  PostWorkoutResponse,
  PutWorkoutBody,
  PutWorkoutResponse,
  PutWorkoutsBody,
  PutWorkoutsResponse,
  UserId,
  Workout,
  WorkoutDoc,
  WorkoutId,
  WorkoutList,
} from '../../../models';
import { UserService } from '../../../services';
import { IsEditingService } from './is-editing.service';

@Injectable({
  providedIn: 'root',
})
export class WorkoutsService {
  private apiUrl = environment.api + 'workouts';

  private http = inject(HttpClient);
  private userService = inject(UserService);
  private editService = inject(IsEditingService);

  workoutsResource = httpResource<GetWorkoutsDTO>(() => ({
    url: `${this.apiUrl}/get/${this.userService.user().id}`,
    method: 'GET',
  }));

  private workouts = computed<GetWorkoutsDTO>(() => {
    const workouts = this.editService.editedWorkouts() ?? this.workoutsResource.value() ?? [];
    return workouts;
  });

  sortedWorkouts = computed(() => {
    return [...this.workouts()].sort((a, b) => a.listId - b.listId);
  });

  getWorkout(id: number): Observable<WorkoutDoc> {
    return this.http
      .get<GetWorkoutsDTO>(this.apiUrl + '/get/' + this.userService.user().id)
      .pipe(map((workouts) => workouts.find((w) => w.workoutId === id)!));
  }

  addWorkout(workout: PostWorkoutBody): Observable<PostWorkoutResponse> {
    return this.http.post<PostWorkoutResponse>(this.apiUrl + '/add', workout).pipe(
      tap((createdWorkout) => {
        const workouts = [...this.workouts(), createdWorkout];
        this.workoutsResource.set(workouts);
      }),
    );
  }

  changeWorkoutName(workout: PostWorkoutBody): Observable<PostWorkoutResponse> {
    return this.http.post<PostWorkoutResponse>(this.apiUrl + '/change-name', workout).pipe(
      tap((updatedWorkout) => {
        const updated = this.workouts().map((w) =>
          w.workoutId === updatedWorkout.workoutId ? { ...w, ...updatedWorkout } : w,
        );

        this.workoutsResource.set(updated);
        this.editService.editedWorkouts.set(updated);
      }),
    );
  }

  updateWorkoutList(workout: PutWorkoutBody): Observable<PutWorkoutResponse> {
    return this.http.post<PutWorkoutResponse>(`${this.apiUrl}/change-list`, workout).pipe(
      tap((updatedWorkout) => {
        const updated = this.workouts().map((w) =>
          w.workoutId === updatedWorkout.workoutId ? { ...w, ...updatedWorkout } : w,
        );

        this.workoutsResource.set(updated);
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

  deleteWorkout(id: WorkoutId): Observable<void> {
    return this.http.delete<void>(this.apiUrl + '/delete/' + id).pipe(
      map(() => {
        const filtered = this.workouts().filter((w) => w.id !== id);
        this.workoutsResource.set(filtered);
        return filtered;
      }),
    );
  }

  initWorkout(name: string, list: WorkoutList): Workout {
    const user = this.userService.user();
    const workoutIds = this.workouts().map((w) => w.workoutId);
    const listIds = this.workouts().map((w) => w.listId);

    return {
      userId: user.id,
      workoutId: workoutIds.length === 0 ? 1 : Math.max(...workoutIds) + 1,
      listId: Math.max(...listIds) + 1,
      lastUpdated: Date.now(),
      name,
      list,
    };
  }

  normalizeWorkoutList(items: ListItem[]): WorkoutList {
    let exerciseIndex = 1;

    return items.map((item, index) => {
      const isExercise = item.type === 'EXERCISE';

      return {
        ...item,
        listId: index,
        itemId: isExercise ? exerciseIndex++ : null,
      };
    }) as WorkoutList;
  }
}
