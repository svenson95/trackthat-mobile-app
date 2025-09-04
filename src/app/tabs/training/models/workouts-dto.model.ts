import type { UnixTimestring } from '../../../models';

export type UserId = string; // mongodb doc id

export type GetWorkoutsDTO = Array<Workout>;

export interface Workout {
  userId: UserId;
  workoutId: number;
  lastUpdated: UnixTimestring;
  name: string;
  list: Array<ListItem | Exercise>;
}

export type ListItem = {
  name: null | string;
  type: ItemType;
};

export type ItemType = 'EXERCISE' | 'LABEL' | 'SPACE';

export interface Exercise extends ListItem {
  muscleGroup: null | MuscleGroup;
  sets: null | string;
  reps: null | string;
  rest: null | string;
}

type MuscleGroup =
  | 'calves'
  | 'adductors'
  | 'abductors'
  | 'hamstrings'
  | 'quads'
  | 'glutes'
  | 'forearms'
  | 'triceps'
  | 'biceps'
  | 'lats'
  | 'abs'
  | 'core'
  | 'chest'
  | 'traps'
  | 'shoulders'
  | 'neck';
