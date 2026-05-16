import { Injectable, signal } from '@angular/core';

import type { ItemListId, WorkoutListId } from '../../../models';

@Injectable({
  providedIn: 'root',
})
export class IsEditingService {
  readonly isEditing = signal<boolean>(false);

  readonly workoutIds = signal<WorkoutListId[]>([]);

  readonly workoutListIds = signal<ItemListId[]>([]);
}
