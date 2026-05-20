import { Injectable, signal } from '@angular/core';

import type { ListItem, WorkoutDoc } from '../../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class IsEditingService {
  readonly isEditing = signal<boolean>(false);

  readonly editedWorkouts = signal<WorkoutDoc[] | null>(null);
  readonly editedList = signal<ListItem[] | null>(null);
}
