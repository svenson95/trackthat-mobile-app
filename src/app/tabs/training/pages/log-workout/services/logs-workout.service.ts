import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap, type Observable } from 'rxjs';

import { environment } from '../../../../../../environments/environment.prod';
import type {
  GetLogWorkoutDTO,
  PostLogWorkoutBody,
  PostLogWorkoutResponse,
  PutLogWorkoutBody,
  PutLogWorkoutResponse,
} from '../../../../../models';

@Injectable({
  providedIn: 'root',
})
export class LogsWorkoutService {
  private apiUrl = environment.api + 'logs-workout';

  private http = inject(HttpClient);

  logId = signal<number | null>(null);

  logWorkoutResource = httpResource<GetLogWorkoutDTO | undefined>(() => {
    const logId = this.logId();
    if (!logId) return undefined;

    return {
      url: `${this.apiUrl}/get/${logId}`,
      method: 'GET',
    };
  });

  // private logWorkout = computed<GetLogWorkoutDTO>(() => {
  //   const workouts = this.logWorkoutResource.value();
  //   if (!workouts) throw new Error('Unexpected workouts undefined');
  //   return workouts;
  // });

  getLogWorkout(date: string): Observable<GetLogWorkoutDTO> {
    return this.http.get<GetLogWorkoutDTO>(this.apiUrl + '/get/' + date);
  }

  addLogWorkout(logWorkout: PostLogWorkoutBody): Observable<PostLogWorkoutResponse> {
    return this.http.post<PostLogWorkoutResponse>(this.apiUrl + '/add', logWorkout).pipe(
      tap((createdLogWorkout) => {
        this.logWorkoutResource.set(createdLogWorkout);
      }),
    );
  }

  updateLogWorkout(log: PutLogWorkoutBody): Observable<PutLogWorkoutResponse> {
    return this.http.post<PutLogWorkoutResponse>(`${this.apiUrl}/update`, log).pipe(
      tap((updatedLog) => {
        this.logWorkoutResource.set(updatedLog);
      }),
    );
  }
}
