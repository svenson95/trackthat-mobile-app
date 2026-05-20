import { HttpClient, httpResource } from '@angular/common/http';
import { computed, effect, inject, Injectable } from '@angular/core';
import { tap, type Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.prod';
import type {
  DeleteLogWorkoutBody,
  DeleteLogWorkoutResponse,
  GetLogWorkoutDTO,
  PostLogWorkoutResponse,
  WorkoutSet,
} from '../../../models';
import { HelperService, UserService } from '../../../services';

@Injectable({
  providedIn: 'root',
})
export class LogsWorkoutService {
  private readonly apiUrl = environment.api + 'logs-workout';
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);
  private readonly helperService = inject(HelperService);

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

  constructor() {
    effect(async () => {
      const error = this.logWorkoutResource.error();
      if (!error) return;

      await this.helperService.showError('tabs.training.log-workout.actions.get-error');
    });
  }

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
    return Math.floor(today.getTime() / 1000).toString();
  }
}
