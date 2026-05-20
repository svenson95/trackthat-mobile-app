import { HttpClient, httpResource } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { type Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment.prod';
import {
  type DeleteLogWorkoutBody,
  type DeleteLogWorkoutResponse,
  type GetLogWorkoutDTO,
  type PostLogWorkoutResponse,
  type WorkoutSet,
  HelperService,
  UserService,
} from '../../../shared';

@Injectable({
  providedIn: 'root',
})
export class LogsWorkoutService {
  private readonly apiUrl = environment.api + 'logs-workout';
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);
  private readonly helperService = inject(HelperService);

  readonly exercise = signal<string | null>(null);

  readonly logWorkoutResource = httpResource<GetLogWorkoutDTO | undefined>(() => {
    const date = this.getTodayStartTimestamp();
    const userId = this.userService.user().id;

    return {
      url: `${this.apiUrl}/get/${date}/${userId}`,
      method: 'GET',
    };
  });

  readonly latestSetResource = httpResource<GetLogWorkoutDTO | undefined>(() => {
    const exercise = this.exercise();
    const userId = this.userService.user().id;

    return {
      url: `${this.apiUrl}/get/latest-log/${exercise}/${userId}`,
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
