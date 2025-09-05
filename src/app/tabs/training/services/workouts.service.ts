import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable, untracked } from '@angular/core';
import { tap, type Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.prod';
import type { GetWorkoutsDTO, Workout, WorkoutDoc, WorkoutId } from '../../../models';
import { AuthService } from '../../../services';

@Injectable({
  providedIn: 'root',
})
export class WorkoutsService {
  private apiUrl = environment.api + 'workouts';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  workoutsResource = httpResource<undefined | GetWorkoutsDTO>(() => {
    const user = untracked(this.authService.user);
    if (!user) throw new Error('Unexpected user undefined');
    const userId = user.id;

    return {
      url: `${this.apiUrl}/get/${userId}`,
      method: 'GET',
    };
  });

  sortedWorkouts = computed<Array<WorkoutDoc>>(() => {
    const user = untracked(this.authService.user);
    if (!user) throw new Error('Unexpected user undefined');
    const workouts = this.workoutsResource.value();
    if (!workouts) throw new Error('Unexpected workouts undefined');
    const ids = user.workoutIds;
    return ids.map((id) => workouts.find((w) => w.workoutId === id)!);
  });

  addWorkout(workout: Workout): Observable<WorkoutDoc> {
    return this.http.post<WorkoutDoc>(this.apiUrl + '/add', workout).pipe(
      tap((createdWorkout) => {
        const current = this.workoutsResource.value();
        if (!current) throw new Error('Unexpected workoutsResource not set');

        const workouts = [...current, createdWorkout];
        this.workoutsResource.set(workouts);

        const ids = workouts.map((w) => w.workoutId);
        const user = this.authService.user();
        if (!user) throw new Error('Unexpected user undefined');
        this.authService.setUserData({ ...user, workoutIds: ids });
      }),
    );
  }

  deleteWorkout(id: WorkoutId): Observable<void> {
    return this.http.delete<void>(this.apiUrl + '/delete/' + id).pipe(
      tap(() => {
        const current = this.workoutsResource.value();
        if (!current) throw new Error('Unexpected workoutsResource not set');

        const filtered = current.filter((w) => w.id !== id);
        this.workoutsResource.set(filtered);

        const ids = filtered.map((w) => w.workoutId);
        const user = this.authService.user();
        if (!user) throw new Error('Unexpected user undefined');
        this.authService.setUserData({ ...user, workoutIds: ids });
      }),
    );
  }

  initWorkout(name: string): Workout {
    const workouts = this.workoutsResource.value();
    if (workouts === undefined) throw new Error('Workouts not loaded');

    return {
      userId: this.authService.user()?.id ?? 'error',
      workoutId: workouts.length === 0 ? 1 : Math.max(...workouts.map((e) => e.workoutId)) + 1,
      lastUpdated: Date.now(),
      name,
      list: [],
    };
  }
}
