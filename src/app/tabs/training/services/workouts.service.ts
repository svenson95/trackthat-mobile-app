import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { map, tap, type Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.prod';
import type {
  GetWorkoutsDTO,
  PostWorkoutBody,
  PostWorkoutResponse,
  Workout,
  WorkoutDoc,
  WorkoutId,
  WorkoutList,
} from '../../../models';
import { UserService } from '../../../services';

@Injectable({
  providedIn: 'root',
})
export class WorkoutsService {
  private apiUrl = environment.api + 'workouts';

  private http = inject(HttpClient);
  private userService = inject(UserService);

  workoutsResource = httpResource<GetWorkoutsDTO | undefined>(() => ({
    url: `${this.apiUrl}/get/${this.userService.user().id}`,
    method: 'GET',
  }));

  private workouts = computed<GetWorkoutsDTO>(() => {
    const workouts = this.workoutsResource.value();
    if (!workouts) throw new Error('Unexpected workouts undefined');
    return workouts;
  });

  sortedWorkouts = computed<Array<WorkoutDoc>>(() =>
    this.userService
      .user()
      .workoutIds.map((id) => this.workouts().find((w) => w.workoutId === id)!),
  );

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

        const ids = workouts.map((w) => w.workoutId);
        this.userService.setUser({ ...this.userService.user(), workoutIds: ids });
      }),
    );
  }

  deleteWorkout(id: WorkoutId): Observable<void> {
    return this.http.delete<void>(this.apiUrl + '/delete/' + id).pipe(
      tap(() => {
        const filtered = this.workouts().filter((w) => w.id !== id);
        this.workoutsResource.set(filtered);

        const ids = filtered.map((w) => w.workoutId);
        this.userService.setUser({ ...this.userService.user(), workoutIds: ids });
      }),
    );
  }

  initWorkout(name: string, list: WorkoutList): Workout {
    const user = this.userService.user();
    const ids = user.workoutIds;

    return {
      userId: user.id,
      workoutId: ids.length === 0 ? 1 : Math.max(...ids) + 1,
      lastUpdated: Date.now(),
      name,
      list,
    };
  }
}
