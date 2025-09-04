import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap, type Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.prod';
import { AuthService } from '../../../services';

import type { GetWorkoutsDTO, Workout } from '../models';

@Injectable({
  providedIn: 'root',
})
export class WorkoutsService {
  private apiUrl = environment.api + 'user-workouts';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  workoutsResource = httpResource<GetWorkoutsDTO>(() => {
    const userId = this.authService.user()?.userId;
    if (!userId) return undefined;
    return { url: `${this.apiUrl}/get/${userId}`, method: 'GET' };
  });

  addWorkout(workout: Workout): Observable<Workout> {
    const userId = this.authService.user()?.userId;
    if (!userId) throw new Error('User ID is not set');

    return this.http.post<Workout>(`${this.apiUrl}/add/${userId}`, workout).pipe(
      tap((createdWorkout) => {
        const current = this.workoutsResource.value();
        if (!current) throw new Error('Unexpected workoutsResource not set');

        this.workoutsResource.set([...current, createdWorkout]);
      }),
    );
  }

  initWorkout(name: string): Workout {
    const workouts = this.workoutsResource.value();
    if (!workouts) throw new Error('Workouts not loaded');

    return {
      userId: this.authService.user()?.userId ?? 'error',
      workoutId: workouts.length === 0 ? 1 : Math.max(...workouts.map((e) => e.workoutId)) + 1,
      lastUpdated: Date.now(),
      name,
      list: [],
    };
  }
}
