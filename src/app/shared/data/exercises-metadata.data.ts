import type { ExerciseEquipment, ExerciseVariant, MuscleGroup } from '../../models';

export interface ExerciseMetadata {
  name: string;
  equipmentTypes: Array<ExerciseEquipment>;
  variants: null | Array<ExerciseVariant>;
  muscleGroups: null | Array<MuscleGroup>;
}

export const EXERCISES_METADATA: Array<ExerciseMetadata> = [
  /* legs */
  {
    name: 'squats',
    equipmentTypes: ['dumbbell', 'barbell', 'machine'],
    variants: null,
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
  },
  {
    name: 'lunges',
    equipmentTypes: ['dumbbell', 'barbell'],
    variants: [],
    muscleGroups: ['quads', 'glutes', 'hamstrings', 'abductors', 'adductors'],
  },
  {
    name: 'calf-raise',
    equipmentTypes: ['dumbbell', 'machine'],
    variants: ['standing', 'seated'],
    muscleGroups: ['quads', 'glutes', 'hamstrings', 'abductors', 'adductors'],
  },

  /* arms */
  {
    name: 'overhead-triceps-extension',
    equipmentTypes: ['dumbbell'],
    variants: ['standing', 'seated'],
    muscleGroups: ['triceps'],
  },
  {
    name: 'french-press',
    equipmentTypes: ['dumbbell', 'barbell'],
    variants: [],
    muscleGroups: ['triceps'],
  },
  {
    name: 'biceps-curls',
    equipmentTypes: ['dumbbell', 'barbell', 'cable-tower', 'machine'],
    variants: ['normal', 'hammer'],
    muscleGroups: ['biceps'],
  },

  /* core & abs */
  {
    name: 'deadlift',
    equipmentTypes: ['dumbbell', 'barbell'],
    variants: ['normal', 'stiff-leg'],
    muscleGroups: ['core', 'abs', 'hamstrings'],
  },
  {
    name: 'plank',
    equipmentTypes: ['bodyweight'],
    variants: [],
    muscleGroups: ['core', 'abs'],
  },
  {
    name: 'side-plank',
    equipmentTypes: ['bodyweight'],
    variants: [],
    muscleGroups: ['core', 'abs'],
  },
  {
    name: 'russian-twist',
    equipmentTypes: ['dumbbell'],
    variants: [],
    muscleGroups: ['core', 'abs'],
  },
  {
    name: 'crunches',
    equipmentTypes: ['bodyweight', 'machine', 'cable-tower'],
    variants: [],
    muscleGroups: ['abs'],
  },

  /* back */
  {
    name: 'lat-pulldown',
    equipmentTypes: ['machine'],
    variants: ['wide', 'close'],
    muscleGroups: ['lats', 'traps', 'biceps'],
  },
  {
    name: 'pull-up',
    equipmentTypes: ['bodyweight', 'machine'],
    variants: [],
    muscleGroups: ['lats', 'traps'],
  },
  {
    name: 'rows',
    equipmentTypes: ['dumbbell', 'barbell', 'cable-tower', 'machine'],
    variants: ['one-arm', 'two-arm'],
    muscleGroups: ['lats', 'traps', 'biceps', 'core'],
  },

  /* chest */
  {
    name: 'benchpress',
    equipmentTypes: ['dumbbell'],
    variants: ['flat', 'decline', 'incline'],
    muscleGroups: ['chest', 'triceps', 'front-delta'],
  },
  {
    name: 'fly',
    equipmentTypes: ['dumbbell', 'cable-tower', 'machine'],
    variants: [],
    muscleGroups: ['chest', 'triceps', 'front-delta'],
  },
  {
    name: 'dips',
    equipmentTypes: ['bodyweight', 'machine'],
    variants: [],
    muscleGroups: ['chest', 'triceps'],
  },

  /* shoulders */
  {
    name: 'shoulder-press',
    equipmentTypes: ['dumbbell', 'barbell', 'machine'],
    variants: [],
    muscleGroups: ['front-delta', 'middle-delta', 'triceps', 'traps'],
  },
  {
    name: 'lateral-raises',
    equipmentTypes: ['dumbbell', 'machine'],
    variants: ['standing', 'seated'],
    muscleGroups: ['middle-delta', 'front-delta'],
  },
  {
    name: 'butterfly-reverse',
    equipmentTypes: ['machine'],
    variants: [],
    muscleGroups: ['rear-delta', 'traps'],
  },
  {
    name: 'bent-over-reverse-fly',
    equipmentTypes: ['dumbbell'],
    variants: ['standing', 'seated'],
    muscleGroups: ['rear-delta', 'traps'],
  },
  {
    name: 'shrugs',
    equipmentTypes: ['dumbbell', 'barbell'],
    variants: [],
    muscleGroups: ['rear-delta', 'traps'],
  },
];
