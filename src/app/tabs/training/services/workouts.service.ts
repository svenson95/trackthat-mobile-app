import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { tap, type Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.prod';
import type { GetWorkoutsDTO, Workout, WorkoutDoc } from '../../../models';
import { AuthService } from '../../../services';

@Injectable({
  providedIn: 'root',
})
export class WorkoutsService {
  private apiUrl = environment.api + 'workouts';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  workoutsResource = httpResource<undefined | GetWorkoutsDTO>(() => {
    const user = this.authService.user();
    if (!user) throw new Error('Unexpected user undefined');
    const userId = user.id;

    return {
      url: `${this.apiUrl}/get/${userId}`,
      method: 'GET',
    };
  });

  sortedWorkouts = computed<Array<WorkoutDoc>>(() => {
    const user = this.authService.user();
    if (!user) throw new Error('Unexpected user undefined');
    const workouts = user.workoutIds;
    return workouts.map((id) => this.workoutsResource.value()!.find((w) => w.workoutId === id)!);
  });

  addWorkout(workout: Workout): Observable<WorkoutDoc> {
    return this.http.post<WorkoutDoc>(this.apiUrl + '/add', workout).pipe(
      tap((createdWorkout) => {
        const current = this.workoutsResource.value();
        if (!current) throw new Error('Unexpected workoutsResource not set');

        this.workoutsResource.set([...current, createdWorkout]);
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
