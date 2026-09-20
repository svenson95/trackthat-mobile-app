import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import type { WorkoutSet } from '../../../../../core';

import { LogWorkoutEditorState } from './log-workout-editor.state';

const createWorkoutSet = (overrides: Partial<WorkoutSet> = {}): WorkoutSet => ({
  load: 80,
  reps: 10,
  exercise: 'Bench Press',
  itemId: 1,
  note: null,
  time: '19:23:45',
  ...overrides,
});

describe('LogWorkoutEditorState', () => {
  let state: LogWorkoutEditorState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LogWorkoutEditorState],
    });

    state = TestBed.inject(LogWorkoutEditorState);
  });

  it('should initially not be editing', () => {
    expect(state.isEditing()).toBe(false);
  });

  it('should initially have no deleted sets', () => {
    expect(state.deletedSets()).toEqual([]);
  });

  it('should initially have no deleted item ids', () => {
    expect(state.deletedItemIds()).toEqual(new Set());
  });

  describe('start', () => {
    it('should start editing', () => {
      state.start();

      expect(state.isEditing()).toBe(true);
    });

    it('should clear previously deleted sets', () => {
      state.deleteSet(createWorkoutSet());

      state.start();

      expect(state.deletedSets()).toEqual([]);
      expect(state.deletedItemIds()).toEqual(new Set());
    });
  });

  describe('deleteSet', () => {
    it('should add a deleted set', () => {
      const set = createWorkoutSet();

      state.deleteSet(set);

      expect(state.deletedSets()).toEqual([set]);
    });

    it('should not add the same item id twice', () => {
      const firstSet = createWorkoutSet({
        itemId: 1,
        reps: 10,
      });

      const duplicateSet = createWorkoutSet({
        itemId: 1,
        reps: 12,
      });

      state.deleteSet(firstSet);
      state.deleteSet(duplicateSet);

      expect(state.deletedSets()).toEqual([firstSet]);
    });

    it('should add sets with different item ids', () => {
      const firstSet = createWorkoutSet({
        itemId: 1,
      });

      const secondSet = createWorkoutSet({
        itemId: 2,
      });

      state.deleteSet(firstSet);
      state.deleteSet(secondSet);

      expect(state.deletedSets()).toEqual([firstSet, secondSet]);
    });

    it('should expose deleted item ids', () => {
      state.deleteSet(
        createWorkoutSet({
          itemId: 3,
        }),
      );

      state.deleteSet(
        createWorkoutSet({
          itemId: 7,
        }),
      );

      expect(state.deletedItemIds()).toEqual(new Set([3, 7]));
    });
  });

  describe('cancel', () => {
    it('should stop editing and clear deleted sets', () => {
      state.start();
      state.deleteSet(createWorkoutSet());

      state.cancel();

      expect(state.isEditing()).toBe(false);
      expect(state.deletedSets()).toEqual([]);
      expect(state.deletedItemIds()).toEqual(new Set());
    });
  });

  describe('finish', () => {
    it('should stop editing and clear deleted sets', () => {
      state.start();
      state.deleteSet(createWorkoutSet());

      state.finish();

      expect(state.isEditing()).toBe(false);
      expect(state.deletedSets()).toEqual([]);
      expect(state.deletedItemIds()).toEqual(new Set());
    });
  });
});
