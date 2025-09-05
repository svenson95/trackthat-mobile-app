import { inject, Injectable, linkedSignal, signal } from '@angular/core';

import type { WorkoutListId } from '../../../models';
import { AuthService } from '../../../services';

@Injectable({
  providedIn: 'root',
})
export class SortingWorkoutsService {
  userService = inject(AuthService);

  isEditing = signal<boolean>(false);

  workoutIds = linkedSignal<Array<WorkoutListId>>(() => {
    const user = this.userService.user();
    if (!user) throw new Error('Unexpected user undefined');
    return user.workoutIds;
  });
}
