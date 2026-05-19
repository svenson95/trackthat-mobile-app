import { HttpClient, httpResource } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
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

  readonly logId = signal<number | undefined>(undefined);

  readonly logWorkoutResource = httpResource<GetLogWorkoutDTO | undefined>(() => {
    const date = this.getTodayStartTimestamp();

    return {
      url: `${this.apiUrl}/get/${date}`,
      method: 'GET',
    };
  });

  resourceEffect = effect(() => {
    const resource = this.logWorkoutResource.value();
    const id = resource ? resource.logId : undefined;
    this.logId.set(id);
  });

  getLogWorkout(date: string): Observable<GetLogWorkoutDTO> {
    return this.http.get<GetLogWorkoutDTO>(this.apiUrl + '/get/' + date);
  }

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
