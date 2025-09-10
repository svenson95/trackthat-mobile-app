import { inject, Injectable, linkedSignal, signal } from '@angular/core';

import type { WorkoutListId } from '../../../models';
import { UserService } from '../../../services';

@Injectable({
  providedIn: 'root',
})
export class SortingWorkoutsService {
  private userService = inject(UserService);

  isEditing = signal<boolean>(false);
  workoutIds = linkedSignal<Array<WorkoutListId>>(() => this.userService.user().workoutIds);
}
