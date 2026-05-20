import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import {
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonSkeletonText,
} from '@ionic/angular/standalone';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import type { WorkoutSet } from '../../../../../../../models';
import { HelperService } from '../../../../../../../services';
import { IsEditingService, LogsWorkoutService } from '../../../../../services';
import { ExerciseItemComponent } from '../../../../workout/components';

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

const ION_COMPONENTS = [
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonSkeletonText,
];

@Component({
  selector: 'app-log-workout-set-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, TranslateModule, ExerciseItemComponent],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 0.5rem;
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
      width: 8%;
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

    ion-item-option.delete-set {
      font-size: 12px;
    }
  `,
  template: `
    @if (isLoading()) {
      <ion-item-group class="exercise-item">
        <ion-item-divider class="exercise-item">
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
        <ion-item-group class="exercise-item">
          <ion-item-divider
            class="exercise-item"
            [class.is-selected-exercise]="exerciseGroup.name === selectedExercise()"
          >
            <app-exercise-item [exercise]="exerciseGroup.name" />
          </ion-item-divider>

          <ion-list class="item-container">
            @for (
              item of exerciseGroup.sets;
              track item.type === 'set' ? item.set.itemId : item.id;
              let idx = $index;
              let isLast = $last
            ) {
              @if (item.type === 'skeleton') {
                <ion-item class="log-set skeleton-log-set" [lines]="isLast ? 'none' : 'inset'">
                  <ion-label>
                    <ion-skeleton-text animated class="set-index-skeleton" />
                    <ion-skeleton-text animated class="set-value-skeleton" />
                    <ion-skeleton-text animated class="set-time-skeleton" />
                    <ion-skeleton-text animated class="set-break-skeleton" />
                  </ion-label>
                </ion-item>
              } @else {
                <ion-item-sliding #slidingItem [disabled]="!isEditing()">
                  <ion-item
                    class="log-set ion-activatable"
                    [lines]="isLast ? 'none' : 'inset'"
                    (click)="setSelected.emit(item.set)"
                  >
                    <ion-label>
                      <h3>#{{ idx + 1 }}</h3>
                      <h3>{{ item.set.reps }}x {{ item.set.load }} kg</h3>
                      <h3>{{ item.set.time }}</h3>
                    </ion-label>
                  </ion-item>

                  <ion-item-options side="end">
                    <ion-item-option
                      class="delete-set"
                      color="danger"
                      (click)="deleteItem(item, item.set.itemId, slidingItem)"
                    >
                      {{ 'general.delete' | translate }}
                    </ion-item-option>
                  </ion-item-options>
                </ion-item-sliding>
              }
            }
          </ion-list>
        </ion-item-group>
      }
    }
  `,
})
export class LogWorkoutSetListComponent {
  readonly skeletonSets = input<number[]>([]);
  readonly exercises = input.required<ExerciseView[]>();
  readonly selectedExercise = input.required<string>();
  readonly setItemId = input<number>();

  readonly setSelected = output<WorkoutSet>();

  readonly loadingCtrl = inject(LoadingController);
  readonly translate = inject(TranslateService);
  readonly route = inject(ActivatedRoute);
  readonly location = inject(Location);

  private readonly helperService = inject(HelperService);
  private readonly editService = inject(IsEditingService);
  readonly isEditing = this.editService.isEditing;
  readonly logsWorkoutService = inject(LogsWorkoutService);

  readonly isLoading = computed(() => {
    return this.logsWorkoutService.logWorkoutResource.isLoading();
  });

  readonly routeParams = toSignal(this.route.params, {
    initialValue: this.route.snapshot.params,
  });

  async deleteItem(
    item: ExerciseSetView,
    itemId: number,
    slidingItem: IonItemSliding,
  ): Promise<void> {
    if (item.type !== 'set') return;
    await slidingItem.close();

    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('tabs.training.log-workout.actions.delete-set.process'),
      spinner: 'circles',
    });
    await loading.present();

    const logId = String(this.logsWorkoutService.logId()!);
    this.logsWorkoutService.deleteSet(logId, itemId, item.set).subscribe({
      next: async (response) => {
        await loading.dismiss();
        if (response === null) {
          this.isEditing.set(false);
        }
      },
      error: async (err) => {
        console.error('Unexpected fail during delete log-workout.set', err);
        await loading.dismiss();
        await this.helperService.showError('tabs.training.log-workout.actions.delete-set.error');
      },
    });
  }
}
