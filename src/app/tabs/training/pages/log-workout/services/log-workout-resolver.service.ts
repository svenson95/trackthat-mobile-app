import { inject, Injectable } from '@angular/core';
import {
  RedirectCommand,
  Router,
  type ActivatedRouteSnapshot,
  type Resolve,
} from '@angular/router';
import { catchError, map, of, type Observable } from 'rxjs';

import type { LogWorkoutDoc } from '../../../../../models';

import { LogsWorkoutService } from './logs-workout.service';

@Injectable()
export class LogWorkoutResolver implements Resolve<LogWorkoutDoc | RedirectCommand> {
  private readonly logWorkoutService = inject(LogsWorkoutService);
  private readonly router = inject(Router);

  resolve(
    route: ActivatedRouteSnapshot,
  ): Observable<LogWorkoutDoc | RedirectCommand> | LogWorkoutDoc | RedirectCommand {
    const workoutId = Number(route.paramMap.get('workoutId'));
    const logId = Number(route.paramMap.get('logId'));

    if (logId) {
      return new RedirectCommand(
        this.router.parseUrl('/tabs/training/' + workoutId + '/log/' + logId),
      );
    }

    const cachedLog = this.logWorkoutService.logWorkoutResource.value();
    if (cachedLog) {
      return of(cachedLog);
    }
    const today = Date.now().toString();
    return this.logWorkoutService.getLogWorkout(today).pipe(
      map((log) => log),
      catchError(() =>
        of(new RedirectCommand(this.router.parseUrl(`/tabs/training/${workoutId}`))),
      ),
    );
  }
}
