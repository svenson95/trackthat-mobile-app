import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap, type Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.prod';
import type {
  GetLogWorkoutDTO,
  PostLogWorkoutBody,
  PostLogWorkoutResponse,
  PutLogWorkoutBody,
  PutLogWorkoutResponse,
} from '../../../models';

@Injectable({
  providedIn: 'root',
})
export class LogsWorkoutService {
  private apiUrl = environment.api + 'logs-workout';

  private http = inject(HttpClient);

  readonly logId = signal<number | undefined>(undefined);

  readonly logWorkoutResource = httpResource<GetLogWorkoutDTO | undefined>(() => {
    const date = this.getTodayStartTimestamp();

    return {
      url: `${this.apiUrl}/get/${date}`,
      method: 'GET',
    };
  });

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

  private getTodayStartTimestamp(): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return today.getTime().toString();
  }
}
