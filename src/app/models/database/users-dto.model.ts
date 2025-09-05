import type { WorkoutId } from './workouts-dto.model';

export type UserId = string; // mongodb doc id

export interface User {
  googleId: string;
  name: string;
  picture: string;
  email: string;
  weight: number;
  height: number;
  workoutIds: Array<WorkoutId>;
}

export interface UserDoc extends User {
  readonly id: UserId;
}

export type GetUsersDTO = Array<UserDoc>;
