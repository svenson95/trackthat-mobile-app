import type { UnixTimestring } from '../date-helper.model';
import type { UserId } from './users.model';

export type WorkoutId = string; // mongodb doc id
export type WorkoutListId = number; // custom id (user.workoutIds)

export interface Workout {
  userId: UserId;
  workoutId: WorkoutListId;
  lastUpdated: UnixTimestring;
  name: string;
  list: WorkoutList;
}

export type WorkoutList = Array<ListItem | ListItemExercise>;

export type ListItem = {
  name: null | string;
  type: ListItemType;
};

export type ListItemType = 'HEADER' | 'EXERCISE' | 'LABEL' | 'SPACER';

export interface ListItemExercise extends ListItem {
  equipment: ExerciseEquipment;
  variant: null | ExerciseVariant;
  sets: null | string;
  reps: null | string;
  rest: null | string;
}

export type ExerciseEquipment = 'dumbbell' | 'barbell' | 'cable-tower' | 'machine' | 'bodyweight';
export type ExerciseVariant =
  // benchpress
  | 'flat'
  | 'decline'
  | 'incline'

  // legs
  | 'normal'
  | 'stiff-leg'

  // calves
  | 'standing'
  | 'seated'

  // biceps
  | 'normal'
  | 'hammer'
  | 'concentration'

  // back
  | 'wide'
  | 'close'
  | 'one-arm'
  | 'two-arm'
  | 'bent-over';

export type MuscleGroup =
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
  | 'front-delta'
  | 'middle-delta'
  | 'rear-delta'
  | 'traps'
  | 'neck';

export interface WorkoutDoc extends Workout {
  readonly id: WorkoutId;
}

export type GetWorkoutsDTO = Array<WorkoutDoc>;
export type PostWorkoutBody = Workout;
export type PostWorkoutResponse = WorkoutDoc;
