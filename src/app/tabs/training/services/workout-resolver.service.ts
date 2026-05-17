import { inject, Injectable } from '@angular/core';
import {
  RedirectCommand,
  Router,
  type ActivatedRouteSnapshot,
  type Resolve,
} from '@angular/router';
import { catchError, map, of, type Observable } from 'rxjs';

import type { WorkoutDoc } from '../../../models';

import { WorkoutsService } from './workouts.service';

@Injectable({
  providedIn: 'root',
})
export class WorkoutResolver implements Resolve<WorkoutDoc | RedirectCommand> {
  private readonly workoutService = inject(WorkoutsService);
  private readonly router = inject(Router);

  resolve(
    route: ActivatedRouteSnapshot,
  ): Observable<WorkoutDoc | RedirectCommand> | WorkoutDoc | RedirectCommand {
    const workoutId = Number(route.paramMap.get('workoutId'));

    if (!workoutId) {
      return new RedirectCommand(this.router.parseUrl('/tabs/training'));
    }

    const workouts = this.workoutService.workoutsResource.value();
    const cachedWorkout = workouts?.find((w) => w.workoutId === workoutId);

    if (cachedWorkout) {
      return cachedWorkout;
    }

    return this.workoutService.getWorkout(workoutId).pipe(
      map((workout) =>
        workout ? workout : new RedirectCommand(this.router.parseUrl('/tabs/training')),
      ),
      catchError(() => of(new RedirectCommand(this.router.parseUrl('/tabs/training')))),
    );
  }
}
