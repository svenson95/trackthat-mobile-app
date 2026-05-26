import type { UserId } from './users.model';

export type LogWorkoutId = string; // mongodb doc id

export interface Log {
  date: number;
  userId: UserId;
  logId: number;
}

export interface WorkoutSet {
  load: number;
  reps: number;
  exercise: string;
  itemId: number;
  note: string | null;
  time: string; // format: '19:23:45'
}

export interface LogWorkout extends Log {
  sets: Array<WorkoutSet>;
}

export interface LogFood extends Log {
  name: string;
  // kcal etc.
}

export interface LogWorkoutDoc extends LogWorkout {
  readonly id: LogWorkoutId;
}

export type GetLogWorkoutDTO = LogWorkoutDoc;
export type GetLogsWorkoutDTO = Array<LogWorkoutDoc>;

export type PostLogWorkoutBody = LogWorkout;
export type PostLogWorkoutResponse = LogWorkoutDoc;

export type DeleteLogWorkoutBody = WorkoutSet;
export type DeleteLogWorkoutResponse = LogWorkoutDoc | undefined;
