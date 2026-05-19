import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { tap, type Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.prod';
import type {
  DeleteLogWorkoutBody,
  DeleteLogWorkoutResponse,
  GetLogWorkoutDTO,
  PostLogWorkoutResponse,
  WorkoutSet,
} from '../../../models';

@Injectable({
  providedIn: 'root',
})
export class LogsWorkoutService {
  private apiUrl = environment.api + 'logs-workout';

  private http = inject(HttpClient);

  readonly logWorkoutResource = httpResource<GetLogWorkoutDTO | null>(() => {
    const date = this.getTodayStartTimestamp();

    return {
      url: `${this.apiUrl}/get/${date}`,
      method: 'GET',
    };
  });

  readonly logId = computed<number | undefined>(() => {
    const logWorkout = this.logWorkoutResource.value();
    return logWorkout?.logId;
  });

  addLogWorkout(date: string, set: WorkoutSet, userId: string): Observable<PostLogWorkoutResponse> {
    return this.http
      .post<PostLogWorkoutResponse>(this.apiUrl + `/add/set/${date}/${userId}`, set)
      .pipe(
        tap((createdLogWorkout) => {
          this.logWorkoutResource.set(createdLogWorkout);
        }),
      );
  }

  deleteSet(
    logId: string,
    itemId: number,
    set: DeleteLogWorkoutBody,
  ): Observable<DeleteLogWorkoutResponse> {
    return this.http
      .delete<DeleteLogWorkoutResponse>(`${this.apiUrl}/delete/${logId}/${itemId}`, {
        body: set,
      })
      .pipe(
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
