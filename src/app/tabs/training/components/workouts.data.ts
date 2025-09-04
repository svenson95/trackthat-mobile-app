import type { Workout } from '../models';

export const WORKOUTS_TEMPLATES: Array<Workout> = [
  {
    userId: 'user-1',
    workoutId: 1,
    name: '5er Split Home',
    lastUpdated: 815350254,
    list: [
      {
        name: '#1 Brust Trizeps',
        type: 'LABEL',
      },
      {
        name: 'Bankdrücken',
        type: 'EXERCISE',
        muscleGroup: 'chest',
        sets: '2-3',
        reps: '15-18',
        rest: null,
      },
      {
        name: 'Fliegende Kurzhantel',
        type: 'EXERCISE',
        muscleGroup: 'chest',
        sets: '1-2',
        reps: '15-18',
        rest: null,
      },
      {
        name: null,
        type: 'SPACE',
      },
      {
        name: '#2 Schulter Bizeps',
        type: 'LABEL',
      },
    ],
  },
  {
    userId: 'user-1',
    workoutId: 2,
    name: '4er Split Home',
    lastUpdated: 1756804801,
    list: [
      {
        name: '#1 Brust Trizeps',
        type: 'LABEL',
      },
      {
        name: 'Bankdrücken',
        type: 'EXERCISE',
        muscleGroup: 'chest',
        sets: '2-3',
        reps: '15-18',
        rest: null,
      },
      {
        name: 'Fliegende Kurzhantel',
        type: 'EXERCISE',
        muscleGroup: 'chest',
        sets: '1-2',
        reps: '15-18',
        rest: null,
      },
      {
        name: null,
        type: 'SPACE',
      },
      {
        name: '#2 Schulter Bizeps',
        type: 'LABEL',
      },
    ],
  },
  {
    userId: 'user-1',
    workoutId: 3,
    name: 'Ganzkörper-Plan',
    lastUpdated: 1756804801,
    list: [
      {
        name: '#1 Brust Trizeps',
        type: 'LABEL',
      },
      {
        name: 'Bankdrücken',
        type: 'EXERCISE',
        muscleGroup: 'chest',
        sets: '2-3',
        reps: '15-18',
        rest: null,
      },
      {
        name: 'Fliegende Kurzhantel',
        type: 'EXERCISE',
        muscleGroup: 'chest',
        sets: '1-2',
        reps: '15-18',
        rest: null,
      },
      {
        name: null,
        type: 'SPACE',
      },
      {
        name: '#2 Schulter Bizeps',
        type: 'LABEL',
      },
    ],
  },
  {
    userId: 'user-1',
    workoutId: 4,
    name: '2er Split Home',
    lastUpdated: 1756804801,
    list: [
      {
        name: '#1 Brust Trizeps',
        type: 'LABEL',
      },
      {
        name: 'Bankdrücken',
        type: 'EXERCISE',
        muscleGroup: 'chest',
        sets: '2-3',
        reps: '15-18',
        rest: null,
      },
      {
        name: 'Fliegende Kurzhantel',
        type: 'EXERCISE',
        muscleGroup: 'chest',
        sets: '1-2',
        reps: '15-18',
        rest: null,
      },
      {
        name: null,
        type: 'SPACE',
      },
      {
        name: '#2 Schulter Bizeps',
        type: 'LABEL',
      },
    ],
  },
];
