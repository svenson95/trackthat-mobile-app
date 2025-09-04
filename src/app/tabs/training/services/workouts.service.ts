import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap, type Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.prod';
import { AuthService } from '../../../services';

import type { WorkoutData, WorkoutsDTO } from '../models';

@Injectable({
  providedIn: 'root',
})
export class WorkoutsService {
  private apiUrl = environment.api + 'user-workouts';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  workoutsResource = httpResource<WorkoutsDTO>(() => {
    const userId = this.authService.user()?.userId;
    if (!userId) return undefined;
    return { url: `${this.apiUrl}/id/${userId}`, method: 'GET' };
  });

  addWorkout(workout: WorkoutData): Observable<WorkoutData> {
    const userId = this.authService.user()?.userId;
    if (!userId) throw new Error('User ID is not set');

    return this.http.post<WorkoutData>(`${this.apiUrl}/add/${userId}`, workout).pipe(
      tap((createdWorkout) => {
        const current = this.workoutsResource.value();
        if (!current) throw new Error('Unexpected workoutsResource not set');

        this.workoutsResource.set({
          ...current,
          workouts: [...current.workouts, createdWorkout],
        });
      }),
    );
  }
}
