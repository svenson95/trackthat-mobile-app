import type { Workout } from '../../models';

export const WORKOUT_TEMPLATES: Array<Workout> = [
  {
    userId: 'user-1',
    workoutId: 5,
    name: '5er Split',
    lastUpdated: 815350254,
    list: [
      {
        type: 'HEADER',
        name: '#1 Brust Trizeps',
      },
      {
        type: 'EXERCISE',
        name: 'benchpress',
        equipment: 'dumbbell',
        variant: 'flat',
      },
      {
        type: 'EXERCISE',
        name: 'fly',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'overhead-triceps-extension',
        equipment: 'dumbbell',
        variant: 'standing',
      },
      {
        type: 'SPACER',
        name: null,
      },
      {
        type: 'HEADER',
        name: '#2 Schulter Bizeps',
      },
      {
        type: 'EXERCISE',
        name: 'shoulder-press',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'lateral-raises',
        equipment: 'dumbbell',
        variant: 'standing',
      },
      {
        type: 'EXERCISE',
        name: 'biceps-curls',
        equipment: 'dumbbell',
        variant: 'hammer',
      },
      {
        type: 'SPACER',
        name: null,
      },
      {
        type: 'HEADER',
        name: '#3 Beine Waden',
      },
      {
        type: 'EXERCISE',
        name: 'squats',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'lunges',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'deadlift',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'calf-raise',
        equipment: 'dumbbell',
        variant: 'standing',
      },
      {
        type: 'SPACER',
        name: null,
      },
      {
        type: 'HEADER',
        name: '#4 Rücken Nacken',
      },
      {
        type: 'EXERCISE',
        name: 'rows',
        variant: 'one-arm',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'bent-over-reverse-fly',
        equipment: 'dumbbell',
        variant: 'standing',
      },
      {
        type: 'EXERCISE',
        name: 'shrugs',
        equipment: 'dumbbell',
      },
      {
        type: 'SPACER',
        name: null,
      },
      {
        type: 'HEADER',
        name: '#5 Rumpf Bauch',
      },
      {
        type: 'EXERCISE',
        name: 'plank',
        equipment: 'bodyweight',
      },
      {
        type: 'EXERCISE',
        name: 'side-plank',
        equipment: 'bodyweight',
      },
      {
        type: 'EXERCISE',
        name: 'crunches',
        equipment: 'bodyweight',
      },
      {
        type: 'EXERCISE',
        name: 'russian-twist',
        equipment: 'dumbbell',
      },
    ],
  },
  {
    userId: 'user-1',
    workoutId: 4,
    name: '4er Split',
    lastUpdated: 1756804801,
    list: [
      {
        type: 'HEADER',
        name: '#1 Brust Nacken',
      },
      {
        type: 'EXERCISE',
        name: 'benchpress',
        equipment: 'dumbbell',
        variant: 'flat',
      },
      {
        type: 'EXERCISE',
        name: 'fly',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'shrugs',
        equipment: 'dumbbell',
      },
      {
        type: 'SPACER',
        name: null,
      },
      {
        type: 'HEADER',
        name: '#2 Rücken Rumpf Bauch',
      },
      {
        type: 'EXERCISE',
        name: 'rows',
        variant: 'one-arm',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'bent-over-reverse-fly',
        equipment: 'dumbbell',
        variant: 'standing',
      },
      {
        type: 'EXERCISE',
        name: 'plank',
        equipment: 'bodyweight',
      },
      {
        type: 'EXERCISE',
        name: 'side-plank',
        equipment: 'bodyweight',
      },
      {
        type: 'EXERCISE',
        name: 'crunches',
        equipment: 'bodyweight',
      },
      {
        type: 'EXERCISE',
        name: 'russian-twist',
        equipment: 'dumbbell',
      },
      {
        type: 'SPACER',
        name: null,
      },
      {
        type: 'HEADER',
        name: '#3 Schultern Arme',
      },
      {
        type: 'EXERCISE',
        name: 'shoulder-press',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'lateral-raises',
        equipment: 'dumbbell',
        variant: 'standing',
      },
      {
        type: 'EXERCISE',
        name: 'biceps-curls',
        equipment: 'dumbbell',
        variant: 'hammer',
      },
      {
        type: 'EXERCISE',
        name: 'overhead-triceps-extension',
        equipment: 'dumbbell',
        variant: 'standing',
      },
      {
        type: 'SPACER',
        name: null,
      },
      {
        type: 'HEADER',
        name: '#4 Beine Waden',
      },
      {
        type: 'EXERCISE',
        name: 'squats',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'lunges',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'deadlift',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'calf-raise',
        equipment: 'dumbbell',
        variant: 'standing',
      },
    ],
  },
  {
    userId: 'user-1',
    workoutId: 2,
    name: '2er Split',
    lastUpdated: 1756804801,
    list: [
      {
        type: 'HEADER',
        name: '#1 Rücken Beine Brust',
      },
      {
        type: 'EXERCISE',
        name: 'rows',
        variant: 'one-arm',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'bent-over-reverse-fly',
        equipment: 'dumbbell',
        variant: 'standing',
      },
      {
        type: 'EXERCISE',
        name: 'squats',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'lunges',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'deadlift',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'benchpress',
        equipment: 'dumbbell',
        variant: 'flat',
      },
      {
        type: 'SPACER',
        name: null,
      },
      {
        type: 'HEADER',
        name: '#2 Schultern Nacken Arme',
      },
      {
        type: 'EXERCISE',
        name: 'shoulder-press',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'lateral-raises',
        equipment: 'dumbbell',
        variant: 'standing',
      },
      {
        type: 'EXERCISE',
        name: 'shrugs',
        equipment: 'dumbbell',
      },
      {
        type: 'EXERCISE',
        name: 'biceps-curls',
        equipment: 'dumbbell',
        variant: 'hammer',
      },
      {
        type: 'EXERCISE',
        name: 'overhead-triceps-extension',
        equipment: 'dumbbell',
        variant: 'standing',
      },
    ],
  },
];
