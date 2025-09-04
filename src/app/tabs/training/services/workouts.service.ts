import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
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
    const userId = this.authService.user()?._id;
    if (!userId) return undefined;
    return { url: `${this.apiUrl}/get/${userId}`, method: 'GET' };
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
      userId: this.authService.user()?._id ?? 'error',
      workoutId: workouts.length === 0 ? 1 : Math.max(...workouts.map((e) => e.workoutId)) + 1,
      lastUpdated: Date.now(),
      name,
      list: [],
    };
  }
}
