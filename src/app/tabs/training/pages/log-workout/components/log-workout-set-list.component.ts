import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonSkeletonText,
} from '@ionic/angular/standalone';

import type { WorkoutSet } from '../../../../../models';
import { ExerciseItemComponent } from '../../workout/components';

export type ExerciseSetView =
  | {
      type: 'set';
      set: WorkoutSet;
    }
  | {
      type: 'skeleton';
      id: string;
      exercise: string;
      time: string;
    };

export type ExerciseView = {
  name: string;
  sets: ExerciseSetView[];
};

const ION_COMPONENTS = [IonItem, IonItemDivider, IonItemGroup, IonLabel, IonSkeletonText];

@Component({
  selector: 'app-log-workout-set-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, ExerciseItemComponent],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      margin-top: 1rem;
      gap: 0.5rem;
    }

    ion-item-divider {
      min-height: 40px;
      background-color: transparent;
      margin-top: 1rem;
      --padding-start: 12px;
    }

    .log-set {
      --min-height: 32px;

      ion-label {
        margin-top: 2px;
        margin-bottom: 2px;
        margin-inline-end: 0;
      }
    }

    .item-container {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      ion-label {
        display: flex;
        justify-content: space-between;

        h3 {
          margin-bottom: 0;
        }
      }
    }

    .exercise-skeleton-title {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
    }

    .rounded-skeleton {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      flex: 0 0 auto;
    }

    .title-skeleton {
      width: 60%;
      height: 1rem;
      border-radius: 999px;
    }

    .skeleton-log-set {
      pointer-events: none;
    }

    .set-index-skeleton {
      width: 6%;
      height: 0.875rem;
      border-radius: 999px;
    }

    .set-value-skeleton {
      width: 25%;
      height: 0.875rem;
      border-radius: 999px;
    }

    .set-time-skeleton {
      width: 22%;
      height: 0.875rem;
      border-radius: 999px;
    }

    .set-break-skeleton {
      width: 14%;
      height: 0.875rem;
      border-radius: 999px;
    }
  `,
  template: `
    @if (isLoading()) {
      <ion-item-group>
        <ion-item-divider>
          <div class="exercise-skeleton-title">
            <ion-skeleton-text animated class="rounded-skeleton" />
            <ion-skeleton-text animated class="title-skeleton" />
          </div>
        </ion-item-divider>

        <div class="item-container">
          @for (item of skeletonSets(); track item) {
            <ion-item class="log-set skeleton-log-set" lines="none">
              <ion-label>
                <ion-skeleton-text animated class="set-index-skeleton" />
                <ion-skeleton-text animated class="set-value-skeleton" />
                <ion-skeleton-text animated class="set-time-skeleton" />
              </ion-label>
            </ion-item>
          }
        </div>
      </ion-item-group>
    } @else {
      @for (exerciseGroup of exercises(); track exerciseGroup.name) {
        <ion-item-group>
          <ion-item-divider>
            <app-exercise-item [exercise]="exerciseGroup.name" />
          </ion-item-divider>

          <div class="item-container">
            @for (
              item of exerciseGroup.sets;
              track item.type === 'set' ? item.set.itemId : item.id;
              let idx = $index
            ) {
              @if (item.type === 'skeleton') {
                <ion-item class="log-set skeleton-log-set" lines="none">
                  <ion-label>
                    <ion-skeleton-text animated class="set-index-skeleton" />
                    <ion-skeleton-text animated class="set-value-skeleton" />
                    <ion-skeleton-text animated class="set-time-skeleton" />
                    <ion-skeleton-text animated class="set-break-skeleton" />
                  </ion-label>
                </ion-item>
              } @else {
                <ion-item
                  class="log-set ion-activatable"
                  lines="none"
                  (click)="setSelected.emit(item.set)"
                >
                  <ion-label>
                    <h3>#{{ idx + 1 }}</h3>
                    <h3>{{ item.set.reps }}x {{ item.set.load }} kg</h3>
                    <h3>{{ item.set.time }}</h3>
                  </ion-label>
                </ion-item>
              }
            }
          </div>
        </ion-item-group>
      }
    }
  `,
})
export class LogWorkoutSetListComponent {
  readonly isLoading = input<boolean>(false);
  readonly skeletonSets = input<number[]>([]);
  readonly exercises = input.required<ExerciseView[]>();

  readonly setSelected = output<WorkoutSet>();
}
