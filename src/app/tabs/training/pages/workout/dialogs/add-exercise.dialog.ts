import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TranslateModule } from '@ngx-translate/core';

import type { ListItemExercise, WorkoutList } from '../../../../../models';
import type { ExerciseMetadata } from '../../../../../shared';
import { EXERCISES_METADATA } from '../../../../../shared';

import { ExerciseItemComponent } from '../components';

const ION_COMPONENTS = [
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonContent,
  IonTitle,
  IonItem,
  IonList,
  IonItemGroup,
  IonLabel,
  IonItemDivider,
];

@Component({
  selector: 'app-add-item-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, FormsModule, TranslateModule, ExerciseItemComponent],
  styles: `
    h4 {
      margin-left: 1rem;
    }

    ion-content {
      --padding-bottom: 10rem;
    }
  `,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="cancel()">Abbrechen</ion-button>
        </ion-buttons>
        <ion-title>{{ 'tabs.training.workout.actions.add-exercise' | translate }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-list>
        @for (group of exercises; track group.name) {
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ 'general.muscles.' + group.name | translate }}</ion-label>
            </ion-item-divider>

            @for (exercise of group.exercises; track exercise.name) {
              <ion-item button (click)="confirm(exercise)">
                <app-exercise-item [exercise]="exercise.name" />
              </ion-item>
            }
          </ion-item-group>
        }
      </ion-list>
    </ion-content>
  `,
})
export class AddExerciseDialog {
  @Input() currentList!: WorkoutList;

  private modalCtrl = inject(ModalController);

  readonly exercises = EXERCISES_METADATA;

  cancel(): void {
    void this.modalCtrl.dismiss(null, 'cancel');
  }

  async confirm(exercise: ExerciseMetadata): Promise<void> {
    const getNextId = (key: 'itemId' | 'listId'): number =>
      this.currentList.length === 0
        ? 0
        : Math.max(...this.currentList.map((item) => item[key])) + 1;

    // TODO: add missing options like 'variant', 'sets', ...
    const addExercise: ListItemExercise = {
      name: exercise.name,
      type: 'EXERCISE',
      itemId: getNextId('itemId'),
      listId: getNextId('listId'),
      equipment: exercise.equipmentTypes[0], // TODO: change equipmetTypes type array -> single-item
      variant: exercise.variants ? exercise.variants[0] : null,
      sets: '0',
      reps: '0',
      rest: '0',
    };

    await this.modalCtrl.dismiss(addExercise);
  }
}
