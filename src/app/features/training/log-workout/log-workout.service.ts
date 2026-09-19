import { HttpClient, httpResource } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { concatMap, from, last, tap, type Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.prod';
import {
  UserService,
  type DeleteLogWorkoutBody,
  type DeleteLogWorkoutResponse,
  type ExerciseWorkoutHistoryDTO,
  type GetLogWorkoutDTO,
  type PostLogWorkoutResponse,
  type WorkoutSet,
} from '../../../core';
import { IonicUiService } from '../../../shared';

@Injectable()
export class LogWorkoutService {
  private readonly apiUrl = environment.api + 'logs-workout';

  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);
  private readonly ionicUiService = inject(IonicUiService);

  private readonly INITIAL_HISTORY_LIMIT = 2;
  private readonly LOAD_MORE_HISTORY_LIMIT = 1;

  readonly exercise = signal<string | null>(null);

  readonly logWorkoutResource = httpResource<GetLogWorkoutDTO | undefined>(() => {
    const date = Math.floor(Date.now() / 1000);
    const userId = this.userService.userData()?.id;

    if (!userId) {
      return undefined;
    }

    return {
      url: `${this.apiUrl}/get/latest-workout/${date}/${userId}`,
      method: 'GET',
    };
  });

  readonly exerciseHistoryResource = httpResource<ExerciseWorkoutHistoryDTO | undefined>(() => {
    const exercise = this.exercise();
    const userId = this.userService.userData()?.id;

    if (!exercise || !userId) {
      return undefined;
    }

    return {
      url: `${this.apiUrl}/get/exercise-history/${userId}`,
      method: 'GET',
      params: {
        exercise,
        limit: this.INITIAL_HISTORY_LIMIT,
      },
    };
  });

  readonly logId = computed<number | undefined>(() => {
    const logWorkout = this.logWorkoutResource.value();
    return logWorkout?.logId;
  });

  constructor() {
    effect(async () => {
      const error = this.logWorkoutResource.error();

      if (!error) {
        return;
      }

      await this.ionicUiService.showError('tabs.training.log-workout.actions.get-error');
    });
  }

  addLogWorkout(date: number, set: WorkoutSet, userId: string): Observable<PostLogWorkoutResponse> {
    return this.http
      .post<PostLogWorkoutResponse>(`${this.apiUrl}/add/set/${date}/${userId}`, set)
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

  deleteSets(logId: string, sets: WorkoutSet[]): Observable<DeleteLogWorkoutResponse> {
    return from(sets).pipe(
      concatMap((set) => this.deleteSet(logId, set.itemId, set)),
      last(),
    );
  }

  loadMoreExerciseHistory(): Observable<ExerciseWorkoutHistoryDTO> | undefined {
    const exercise = this.exercise();
    const userId = this.userService.userData()?.id;
    const history = this.exerciseHistoryResource.value();

    if (!exercise || !userId || !history?.hasMore) {
      return undefined;
    }

    const oldestWorkout = history.workouts[history.workouts.length - 1];

    if (!oldestWorkout) {
      return undefined;
    }

    return this.http
      .get<ExerciseWorkoutHistoryDTO>(`${this.apiUrl}/get/exercise-history/${userId}`, {
        params: {
          exercise,
          before: oldestWorkout.date,
          limit: this.LOAD_MORE_HISTORY_LIMIT,
        },
      })
      .pipe(
        tap((response) => {
          this.exerciseHistoryResource.set({
            workouts: [...history.workouts, ...response.workouts],
            hasMore: response.hasMore,
          });
        }),
      );
  }

  appendExerciseHistory(response: ExerciseWorkoutHistoryDTO): void {
    const current = this.exerciseHistoryResource.value();

    this.exerciseHistoryResource.set({
      workouts: [...(current?.workouts ?? []), ...response.workouts],
      hasMore: response.hasMore,
    });
  }
}
