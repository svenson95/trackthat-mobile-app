import { computed, Injectable, signal } from '@angular/core';

import type { WorkoutDoc } from '../../../core';

@Injectable()
export class WorkoutsEditorState {
  private readonly draftSignal = signal<WorkoutDoc[] | null>(null);

  readonly draft = this.draftSignal.asReadonly();
  readonly isEditing = computed(() => this.draftSignal() !== null);

  start(workouts: WorkoutDoc[]): void {
    this.draftSignal.set(structuredClone(workouts));
  }

  update(workouts: WorkoutDoc[]): void {
    this.draftSignal.set(workouts);
  }

  cancel(): void {
    this.draftSignal.set(null);
  }
}
