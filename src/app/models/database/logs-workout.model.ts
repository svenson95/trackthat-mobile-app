import type { UserId } from './users.model';

export type LogWorkoutId = string; // mongodb doc id

export interface Log {
  date: Date;
  userId: UserId;
  logId: number;
}

export interface WorkoutSet {
  load: number;
  reps: number;
  exercise: string;
  itemId: number;
  note: string | null;
}

export interface LogWorkout extends Log {
  sets: WorkoutSet;
}

export interface LogFood extends Log {
  name: string;
  // kcal etc.
}

export interface LogWorkoutDoc extends Log {
  readonly id: LogWorkoutId;
}

export type GetLogWorkoutDTO = LogWorkoutDoc;

export type PostLogWorkoutBody = LogWorkout;
export type PostLogWorkoutResponse = LogWorkoutDoc;

export type PutLogWorkoutBody = LogWorkout;
export type PutLogWorkoutResponse = LogWorkoutDoc;
