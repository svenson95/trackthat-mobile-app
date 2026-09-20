import { beforeEach, describe, expect, it } from 'vitest';

import type { WorkoutDoc } from '../../../../../../core';

import { WorkoutsEditorState } from './workouts-editor.state';

describe('WorkoutsEditorState', () => {
  let state: WorkoutsEditorState;

  const workouts: WorkoutDoc[] = [
    {
      id: 'workout-1',
      userId: 'test-user',
      workoutId: 1,
      listId: 0,
      name: 'Push',
      lastUpdated: 0,
      list: [],
    },
    {
      id: 'workout-2',
      userId: 'test-user',
      workoutId: 2,
      listId: 1,
      name: 'Pull',
      lastUpdated: 0,
      list: [],
    },
  ];

  beforeEach(() => {
    state = new WorkoutsEditorState();
  });

  it('should initially not be editing', () => {
    expect(state.isEditing()).toBe(false);
    expect(state.draft()).toBeNull();
  });

  it('should start editing with a cloned draft', () => {
    state.start(workouts);

    expect(state.isEditing()).toBe(true);
    expect(state.draft()).toEqual(workouts);

    expect(state.draft()).not.toBe(workouts);
    expect(state.draft()?.[0]).not.toBe(workouts[0]);
  });

  it('should update the draft', () => {
    state.start(workouts);

    const updated = [
      {
        ...workouts[1],
        listId: 0,
      },
      {
        ...workouts[0],
        listId: 1,
      },
    ];

    state.update(updated);

    expect(state.draft()).toEqual(updated);
    expect(state.isEditing()).toBe(true);
  });

  it('should cancel editing', () => {
    state.start(workouts);

    state.cancel();

    expect(state.draft()).toBeNull();
    expect(state.isEditing()).toBe(false);
  });
});
