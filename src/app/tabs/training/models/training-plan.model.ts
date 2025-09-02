import type { UnixTimestring } from '../../../models';

export interface TrainingPlan {
  name: string;
  lastUpdated: UnixTimestring;
  sortIndex: number;
}

export type TrainingPlanItem = {
  name: string;
};

export interface TrainingPlanDetails extends TrainingPlan {
  list: Array<TrainingPlanItem>;
}
