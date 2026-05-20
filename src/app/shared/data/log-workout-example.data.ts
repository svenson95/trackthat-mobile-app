import type { WorkoutSet } from '../models';

export const EXERCISES_EXAMPLE_DATA: { name: string; sets: WorkoutSet[] }[] = [
  {
    name: 'benchpress_dumbbell',
    sets: [
      {
        load: 20,
        reps: 10,
        exercise: 'benchpress_dumbbell',
        itemId: 0,
        note: null,
        time: '19:25:35',
      },
      {
        load: 20,
        reps: 9,
        exercise: 'benchpress_dumbbell',
        itemId: 1,
        note: null,
        time: '19:27:00',
      },
      {
        load: 20,
        reps: 8,
        exercise: 'benchpress_dumbbell',
        itemId: 2,
        note: null,
        time: '19:28:40',
      },
    ],
  },
  {
    name: 'biceps_curls_standing_dumbbell',
    sets: [
      {
        load: 12.5,
        reps: 12,
        exercise: 'biceps_curls_standing_dumbbell',
        itemId: 3,
        note: 'Hammer',
        time: '19:22:30',
      },
      {
        load: 10,
        reps: 15,
        exercise: 'biceps_curls_standing_dumbbell',
        itemId: 4,
        note: 'Hammer',
        time: '19:23:55',
      },
    ],
  },
];
