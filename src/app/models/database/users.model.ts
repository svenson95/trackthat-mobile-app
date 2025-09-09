import type { WorkoutListId } from './user-workouts.model';

export type UserId = string; // mongodb doc id

export interface User {
  googleId: string;
  name: string;
  picture: string;
  email: string;
  weight: number;
  height: number;
  workoutIds: Array<WorkoutListId>;
}

export interface UserDoc extends User {
  readonly id: UserId;
}

export type GetUsersResponse = Array<UserDoc>;

export type PutUserWorkoutsBody = Array<WorkoutListId>;
export type PutUserWorkoutsResponse = UserDoc;
