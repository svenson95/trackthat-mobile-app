import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { tap, type Observable } from 'rxjs';

import { UserService } from 'src/app/services';
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
  private readonly apiUrl = environment.api + 'logs-workout';
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  readonly logWorkoutResource = httpResource<GetLogWorkoutDTO | null>(() => {
    const date = this.getTodayStartTimestamp();
    const userId = this.userService.user().id;

    return {
      url: `${this.apiUrl}/get/${date}/${userId}`,
      method: 'GET',
    };
  });

  readonly logId = computed<number | undefined>(() => {
    const logWorkout = this.logWorkoutResource.value();
    return logWorkout?.logId;
  });

  addLogWorkout(date: number, set: WorkoutSet, userId: string): Observable<PostLogWorkoutResponse> {
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
