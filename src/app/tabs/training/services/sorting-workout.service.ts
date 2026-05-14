import { inject, Injectable, linkedSignal, signal } from '@angular/core';

import type { WorkoutListId } from '../../../models';
import { UserService } from '../../../services';

@Injectable({
  providedIn: 'root',
})
export class SortingItemsService {
  private userService = inject(UserService);

  isEditing = signal<boolean>(false);
  itemIds = linkedSignal<Array<WorkoutListId>>(() => {
    // TODO: get itemIds from user-workout docs
    return this.userService.user().workoutIds;
  });
}
