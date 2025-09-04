import type { UnixTimestring } from '../date-helper.model';
import type { UserId } from './users-dto.model';

export type WorkoutId = number; // mongodb doc id

export interface Workout {
  userId: UserId;
  workoutId: number; // user.workouts list id
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

export interface WorkoutDoc extends Workout {
  readonly id: WorkoutId;
}

export type GetWorkoutsDTO = Array<WorkoutDoc>;
