import { inject, Injectable } from '@angular/core';
import type { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import type { Observable } from 'rxjs';

import type { WorkoutDoc } from '../../../models';

import { WorkoutsService } from './workouts.service';

@Injectable({
  providedIn: 'root',
})
export class WorkoutResolver implements Resolve<WorkoutDoc> {
  private readonly workoutService = inject(WorkoutsService);

  resolve(route: ActivatedRouteSnapshot): Observable<WorkoutDoc> | WorkoutDoc {
    const workoutId = Number(route.paramMap.get('workoutId'));

    const workouts = this.workoutService.workoutsResource.value();
    const workout = workouts?.find((w) => w.workoutId === workoutId);
    return workout ?? this.workoutService.getWorkout(workoutId);
  }
}
