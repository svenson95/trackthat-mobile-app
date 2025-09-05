import type { UnixTimestring } from '../date-helper.model';
import type { UserId } from './users-dto.model';

export type WorkoutId = string; // mongodb doc id
export type WorkoutListId = number; // custom id (user.workoutIds)

export interface Workout {
  userId: UserId;
  workoutId: WorkoutListId;
  lastUpdated: UnixTimestring;
  name: string;
  units: Array<WorkoutUnit>;
}

export type WorkoutUnit = {
  name: string;
  exercises: Array<Exercise>;
};

export interface Exercise {
  name: string;
  muscleGroupPrimary: null | MuscleGroup;
  muscleGroupSecondary: null | MuscleGroup;
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
