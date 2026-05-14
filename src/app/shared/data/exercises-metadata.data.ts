import type { ExerciseEquipment, ExerciseVariant, MuscleGroup } from '../../models';

// TODO: missing types for biceps-curls 'barbell', 'cable-tower', 'machine' ...
export interface ExerciseMetadata {
  name: string;
  image: null | string;
  equipmentTypes: Array<ExerciseEquipment>;
  variants: null | Array<ExerciseVariant>;
  muscleGroups: null | Array<MuscleGroup>;
}

export const EXERCISES_METADATA: Array<ExerciseMetadata> = [
  /* legs */
  {
    name: 'squats_dumbbell',
    image: 'squats_dumbbell',
    equipmentTypes: ['dumbbell'],
    variants: null,
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
  },
  {
    name: 'lunges',
    image: null,
    equipmentTypes: ['dumbbell', 'barbell'],
    variants: [],
    muscleGroups: ['quads', 'glutes', 'hamstrings', 'abductors', 'adductors'],
  },
  {
    name: 'calf-raise',
    image: null,
    equipmentTypes: ['dumbbell', 'machine'],
    variants: ['standing', 'seated'],
    muscleGroups: ['quads', 'glutes', 'hamstrings', 'abductors', 'adductors'],
  },

  /* arms */
  {
    name: 'overhead-triceps-extension',
    image: null,
    equipmentTypes: ['dumbbell'],
    variants: ['standing', 'seated'],
    muscleGroups: ['triceps'],
  },
  {
    name: 'french-press',
    image: null,
    equipmentTypes: ['barbell'],
    variants: [],
    muscleGroups: ['triceps'],
  },
  {
    name: 'frenchpress_dumbbell',
    image: 'frenchpress_dumbbell.png',
    equipmentTypes: ['dumbbell'],
    variants: [],
    muscleGroups: ['triceps'],
  },
  {
    name: 'frenchpress_dumbbell_standing',
    image: 'frenchpress_dumbbell_standing.png',
    equipmentTypes: ['dumbbell'],
    variants: [],
    muscleGroups: ['triceps'],
  },
  {
    name: 'biceps_curls_sitting_dumbbell',
    image: 'biceps_curls_sitting_dumbbell',
    equipmentTypes: ['dumbbell'],
    variants: ['normal', 'hammer'],
    muscleGroups: ['biceps'],
  },
  {
    name: 'biceps_curls_standing_dumbbell',
    image: 'biceps_curls_standing_dumbbell',
    equipmentTypes: ['dumbbell'],
    variants: ['normal', 'hammer'],
    muscleGroups: ['biceps'],
  },

  /* core & abs */
  {
    name: 'deadlift_dumbbell',
    image: 'deadlift_dumbbell',
    equipmentTypes: ['dumbbell', 'barbell'],
    variants: ['normal', 'stiff-leg'],
    muscleGroups: ['core', 'abs', 'hamstrings'],
  },
  {
    name: 'plank',
    image: 'plank',
    equipmentTypes: ['bodyweight'],
    variants: [],
    muscleGroups: ['core', 'abs'],
  },
  {
    name: 'side-plank',
    image: null,
    equipmentTypes: ['bodyweight'],
    variants: [],
    muscleGroups: ['core', 'abs'],
  },
  {
    name: 'russian-twist',
    image: null,
    equipmentTypes: ['dumbbell'],
    variants: [],
    muscleGroups: ['core', 'abs'],
  },
  {
    name: 'sit_ups',
    image: 'sit_ups',
    equipmentTypes: ['bodyweight'],
    variants: [],
    muscleGroups: ['abs'],
  },

  /* back */
  {
    name: 'lat-pulldown',
    image: null,
    equipmentTypes: ['machine'],
    variants: ['wide', 'close'],
    muscleGroups: ['lats', 'traps', 'biceps'],
  },
  {
    name: 'pull-up',
    image: null,
    equipmentTypes: ['bodyweight', 'machine'],
    variants: [],
    muscleGroups: ['lats', 'traps'],
  },
  {
    name: 'rows',
    image: null,
    equipmentTypes: ['dumbbell', 'barbell', 'cable-tower', 'machine'],
    variants: ['one-arm', 'two-arm'],
    muscleGroups: ['lats', 'traps', 'biceps', 'core'],
  },
  {
    name: 'rows_dumbbell_bent_over',
    image: 'rows_dumbbell_bent_over',
    equipmentTypes: ['dumbbell'],
    variants: ['two-arm'],
    muscleGroups: ['lats', 'traps', 'biceps', 'core'],
  },
  {
    name: 'rows_dumbbell_one_arm',
    image: 'rows_dumbbell_one_arm',
    equipmentTypes: ['dumbbell'],
    variants: ['one-arm'],
    muscleGroups: ['lats', 'biceps'],
  },

  /* chest */
  {
    name: 'benchpress',
    image: null,
    equipmentTypes: ['dumbbell'],
    variants: ['flat', 'decline', 'incline'],
    muscleGroups: ['chest', 'triceps', 'front-delta'],
  },
  {
    name: 'benchpress_dumbbell',
    image: 'benchpress_dumbbell.png',
    equipmentTypes: ['dumbbell'],
    variants: ['flat'],
    muscleGroups: ['chest', 'triceps', 'front-delta'],
  },
  {
    name: 'benchpress_incline_dumbbell',
    image: 'benchpress_incline_dumbbell.png',
    equipmentTypes: ['dumbbell'],
    variants: ['incline'],
    muscleGroups: ['chest', 'triceps', 'front-delta'],
  },
  {
    name: 'benchpress_incline_multipress',
    image: 'benchpress_incline_multipress.png',
    equipmentTypes: ['multipress'],
    variants: ['incline'],
    muscleGroups: ['chest', 'triceps', 'front-delta'],
  },
  {
    name: 'fly',
    image: null,
    equipmentTypes: ['dumbbell', 'cable-tower', 'machine'],
    variants: [],
    muscleGroups: ['chest', 'triceps', 'front-delta'],
  },
  {
    name: 'fly_dumbbell',
    image: 'fly_dumbbell.png',
    equipmentTypes: ['dumbbell'],
    variants: ['flat'],
    muscleGroups: ['chest'],
  },
  {
    name: 'dips',
    image: null,
    equipmentTypes: ['bodyweight', 'machine'],
    variants: [],
    muscleGroups: ['chest', 'triceps'],
  },

  /* shoulders */
  {
    name: 'shoulder_press_dumbbell',
    image: 'shoulder_press_dumbbell',
    equipmentTypes: ['dumbbell'],
    variants: [],
    muscleGroups: ['front-delta', 'middle-delta', 'triceps', 'traps'],
  },
  {
    name: 'lateral_raises_dumbbell',
    image: 'lateral_raises_dumbbell',
    equipmentTypes: ['dumbbell'],
    variants: ['standing'],
    muscleGroups: ['middle-delta', 'front-delta'],
  },
  {
    name: 'butterfly-reverse',
    image: null,
    equipmentTypes: ['machine'],
    variants: [],
    muscleGroups: ['rear-delta', 'traps'],
  },
  {
    name: 'bent-over-reverse-fly',
    image: null,
    equipmentTypes: ['dumbbell'],
    variants: ['standing', 'seated'],
    muscleGroups: ['rear-delta', 'traps'],
  },
  {
    name: 'shrugs',
    image: 'shrugs_dumbbell',
    equipmentTypes: ['dumbbell'],
    variants: ['standing'],
    muscleGroups: ['rear-delta', 'traps'],
  },
  {
    name: 'shrugs',
    image: 'shrugs_dumbbell_sitting',
    equipmentTypes: ['dumbbell'],
    variants: ['seated'],
    muscleGroups: ['rear-delta', 'traps'],
  },
];
