import { Location, NgTemplateOutlet } from '@angular/common';
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

import { ExerciseItemComponent } from '../../../../../../../shared/components';
import type { WorkoutSet } from '../../../../../../../shared/models';
import { HelperService } from '../../../../../../../shared/services';

import { IsEditingService, LogsWorkoutService } from '../../../../../services';

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
  imports: [...ION_COMPONENTS, NgTemplateOutlet, TranslateModule, ExerciseItemComponent],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 0.5rem;
    }

    ion-item-option.delete-set {
      font-size: 12px;
    }

    ion-item-divider.is-selected-exercise {
      margin-bottom: 1rem;
    }
  `,
  template: `
    <ion-item-divider class="workout-section-divider">
      <ion-label>Aktuelles Training</ion-label>
    </ion-item-divider>

    @if (isLoading()) {
      <ion-item-group class="exercise-item">
        <ion-item-divider class="exercise-item is-selected-exercise">
          <app-exercise-item [exercise]="selectedExercise()" />
        </ion-item-divider>

        <div class="item-container">
          @for (item of skeletonSets(); track item) {
            <ion-item class="log-set skeleton-log-set" [lines]="$last ? 'none' : 'inset'">
              <ion-label>
                <ion-skeleton-text animated class="set-index-skeleton" />
                <ion-skeleton-text animated class="set-value-skeleton" />
                <ion-skeleton-text animated class="set-time-skeleton" />
                <ion-skeleton-text animated class="set-break-skeleton" />
              </ion-label>
            </ion-item>
          }
        </div>
      </ion-item-group>
    } @else {
      @for (exerciseGroup of exerciseGroups(); track exerciseGroup.name) {
        <ng-container
          *ngTemplateOutlet="
            exerciseGroupTemplate;
            context: {
              $implicit: exerciseGroup,
              selected: exerciseGroup.name === selectedExercise(),
            }
          "
        />
      }
    }

    <ng-template #exerciseGroupTemplate let-exerciseGroup let-selected="selected">
      <ion-item-group class="exercise-item">
        <ion-item-divider class="exercise-item" [class.is-selected-exercise]="selected">
          <app-exercise-item [exercise]="exerciseGroup.name" />
        </ion-item-divider>

        @if (exerciseGroup.sets.length > 0) {
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
                    button
                    [detail]="false"
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
        }
      </ion-item-group>
    </ng-template>
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
  readonly logsWorkoutService = inject(LogsWorkoutService);

  readonly isEditing = this.editService.isEditing;

  readonly isLoading = computed<boolean>(() =>
    this.logsWorkoutService.logWorkoutResource.isLoading(),
  );

  readonly exerciseGroups = computed<ExerciseView[]>(() => {
    const exercises = this.exercises();
    const selectedExercise = this.selectedExercise();

    const selectedExerciseExists = exercises.some(({ name }) => name === selectedExercise);

    if (selectedExerciseExists) {
      return exercises;
    }

    return [
      ...exercises,
      {
        name: selectedExercise,
        sets: [],
      },
    ];
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
          this.editService.setIsEditing(false);
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
