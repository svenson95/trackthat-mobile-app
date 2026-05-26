import { Injectable, signal } from '@angular/core';

import type { ListItem, WorkoutDoc } from '../../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class IsEditingService {
  private readonly isEditingSignal = signal<boolean>(false);
  readonly isEditing = this.isEditingSignal.asReadonly();

  private readonly editedWorkoutsSignal = signal<WorkoutDoc[] | null>(null);
  readonly editedWorkouts = this.editedWorkoutsSignal.asReadonly();

  private readonly editedWorkoutListSignal = signal<ListItem[] | null>(null);
  readonly editedWorkoutList = this.editedWorkoutListSignal.asReadonly();

  setIsEditing(value: boolean): void {
    this.isEditingSignal.set(value);
  }

  setEditedWorkouts(value: WorkoutDoc[] | null): void {
    this.editedWorkoutsSignal.set(value);
  }

  setEditedWorkoutList(value: ListItem[] | null): void {
    this.editedWorkoutListSignal.set(value);
  }
}
