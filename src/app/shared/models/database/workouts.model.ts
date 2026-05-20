import type { UnixTimestampMilli } from '../date-helper.model';
import type { UserId } from './users.model';

export type WorkoutId = string; // mongodb doc id
export type WorkoutListId = number;

export interface Workout {
  userId: UserId;
  workoutId: number;
  listId: WorkoutListId;
  lastUpdated: UnixTimestampMilli;
  name: string;
  list: WorkoutList;
}

export type WorkoutList = Array<ListItem | ListItemExercise>;

export type ItemListId = number; // custom id for sorting
export type ListItem = {
  name: null | string;
  itemId: number;
  listId: ItemListId;
  type: ListItemType;
};

export type ListItemType = 'HEADER' | 'EXERCISE' | 'SPACER';

export interface ListItemExercise extends ListItem {
  equipment: ExerciseEquipment;
  variant: null | ExerciseVariant;
  sets: null | string;
  reps: null | string;
  rest: null | string;
}

export type ExerciseEquipment =
  | 'dumbbell'
  | 'barbell'
  | 'multipress'
  | 'cable-tower'
  | 'machine'
  | 'bodyweight';
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
  | 'wide-grip'
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

export const WORKOUT_LIST_ITEM_SPACER: ListItem = {
  type: 'SPACER',
  itemId: 0,
  listId: 0,
  name: null,
};

export const WORKOUT_LIST_ITEM_HEADER: ListItem = {
  type: 'HEADER',
  itemId: 0,
  listId: 0,
  name: '#1 Header',
};

export interface WorkoutDoc extends Workout {
  readonly id: WorkoutId;
}

export type GetWorkoutsResponse = Array<WorkoutDoc>;

export type PutWorkoutsBody = Array<WorkoutDoc>;
export type PutWorkoutsResponse = Array<WorkoutDoc>;

export type PostWorkoutBody = Workout;
export type PostWorkoutResponse = WorkoutDoc;

export type PutWorkoutBody = Workout;
export type PutWorkoutResponse = WorkoutDoc;

export type DeleteWorkoutBody = void;
export type DeleteWorkoutResponse = void;
export type DeleteWorkoutResult = WorkoutDoc[];
