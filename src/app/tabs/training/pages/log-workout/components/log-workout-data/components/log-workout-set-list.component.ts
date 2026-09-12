import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
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
  LoadingController,
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
      type: 'placeholder';
      load: number | null;
      reps: number | null;
      time: string;
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
      margin-bottom: 1rem;
    }

    ion-item-option.delete-set {
      font-size: 12px;
    }

    .placeholder-log-set ion-label {
      color: grey;
    }
  `,
  template: `
    <ion-item-divider class="workout-section-divider">
      <ion-label>Aktuelles Training</ion-label>
    </ion-item-divider>

    @if (isLoading()) {
      <ion-item-group class="exercise-item">
        <ion-item-divider class="exercise-item is-selected-exercise">
          <app-exercise-item [exercise]="exercise().name" />
        </ion-item-divider>

        <ion-list class="item-container">
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
        </ion-list>
      </ion-item-group>
    } @else {
      @let exerciseGroup = exercise();

      <ion-item-group class="exercise-item">
        <ion-item-divider class="exercise-item is-selected-exercise">
          <app-exercise-item [exercise]="exerciseGroup.name" />
        </ion-item-divider>

        <ion-list class="item-container">
          @for (
            item of exerciseGroup.sets;
            track trackSet(item);
            let idx = $index;
            let isLast = $last
          ) {
            @switch (item.type) {
              @case ('set') {
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
                      <h3 class="set-values">
                        <span>{{ item.set.reps }} x</span>
                        <span>{{ item.set.load }} kg</span>
                      </h3>
                      <h3>{{ item.set.time.slice(0, 5) }}</h3>
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

              @case ('placeholder') {
                <ion-item class="log-set placeholder-log-set" [lines]="isLast ? 'none' : 'inset'">
                  <ion-label>
                    <h3>#{{ idx + 1 }}</h3>
                    <h3 class="set-values">
                      <span>{{ item.reps ?? '' }} x</span>
                      <span>{{ item.load ?? '' }} kg</span>
                    </h3>
                    <h3>{{ item.time.slice(0, 5) }}</h3>
                  </ion-label>
                </ion-item>
              }

              @case ('skeleton') {
                <ion-item class="log-set skeleton-log-set" [lines]="isLast ? 'none' : 'inset'">
                  <ion-label>
                    <ion-skeleton-text animated class="set-index-skeleton" />
                    <ion-skeleton-text animated class="set-value-skeleton" />
                    <ion-skeleton-text animated class="set-time-skeleton" />
                    <ion-skeleton-text animated class="set-break-skeleton" />
                  </ion-label>
                </ion-item>
              }
            }
          }
        </ion-list>
      </ion-item-group>
    }
  `,
})
export class LogWorkoutSetListComponent {
  readonly skeletonSets = input<number[]>([]);
  readonly exercise = input.required<ExerciseView>();

  readonly setSelected = output<WorkoutSet>();

  readonly loadingCtrl = inject(LoadingController);
  readonly translate = inject(TranslateService);

  private readonly helperService = inject(HelperService);
  private readonly editService = inject(IsEditingService);
  readonly logsWorkoutService = inject(LogsWorkoutService);

  readonly isEditing = this.editService.isEditing;

  readonly isLoading = computed<boolean>(() =>
    this.logsWorkoutService.logWorkoutResource.isLoading(),
  );

  trackSet(item: ExerciseSetView): string {
    switch (item.type) {
      case 'set':
        return `set-${item.set.itemId}`;

      case 'placeholder':
        return 'placeholder';

      case 'skeleton':
        return `skeleton-${item.id}`;
    }
  }

  async deleteItem(
    item: ExerciseSetView,
    itemId: number,
    slidingItem: IonItemSliding,
  ): Promise<void> {
    if (item.type !== 'set') {
      return;
    }

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
