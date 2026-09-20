import { computed, Injectable, signal } from '@angular/core';

import type { WorkoutSet } from '../../../../../core';

@Injectable()
export class LogWorkoutEditorState {
  private readonly isEditingSignal = signal(false);
  private readonly deletedSetsSignal = signal<WorkoutSet[]>([]);

  readonly isEditing = this.isEditingSignal.asReadonly();
  readonly deletedSets = this.deletedSetsSignal.asReadonly();

  readonly deletedItemIds = computed(() => new Set(this.deletedSets().map((set) => set.itemId)));

  start(): void {
    this.deletedSetsSignal.set([]);
    this.isEditingSignal.set(true);
  }

  deleteSet(set: WorkoutSet): void {
    this.deletedSetsSignal.update((sets) =>
      sets.some((current) => current.itemId === set.itemId) ? sets : [...sets, set],
    );
  }

  cancel(): void {
    this.reset();
  }

  finish(): void {
    this.reset();
  }

  private reset(): void {
    this.deletedSetsSignal.set([]);
    this.isEditingSignal.set(false);
  }
}
