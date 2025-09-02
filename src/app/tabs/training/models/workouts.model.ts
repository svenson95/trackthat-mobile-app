import type { UnixTimestring } from '../../../models';

export interface Workouts {
  plans: Array<Workout>;
  sorting: Array<number>;
}

export interface Workout {
  id: number;
  userId: number;
  name: string;
  lastUpdated: UnixTimestring;
}

export type WorkoutItem = {
  name: string;
};

export interface WorkoutDetails extends Workout {
  list: Array<WorkoutItem>;
}
