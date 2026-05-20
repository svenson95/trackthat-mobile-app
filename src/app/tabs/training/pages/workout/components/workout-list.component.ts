import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  AlertController,
  LoadingController,
  ModalController,
  type ItemReorderEventDetail,
} from '@ionic/angular';
import {
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonReorder,
  IonReorderGroup,
} from '@ionic/angular/standalone';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { type ListItem, type Workout } from '../../../../../models';
import { HelperService } from '../../../../../services';
import { TextInputDialog } from '../../../../../shared';
import { IsEditingService, WorkoutsService } from '../../../services';

import { ExerciseItemComponent } from './exercise-item.component';

const ION_COMPONENTS = [
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonReorder,
  IonReorderGroup,
];

@Component({
  selector: 'app-workout-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, RouterModule, TranslateModule, ExerciseItemComponent],
  styles: `
    .exercise-image {
      margin-right: 0.75rem;
    }
    .label-item {
      font-weight: 700;
    }
  `,
  template: `
    @let list = workout().list;
    <ion-list [inset]="true">
      <ion-reorder-group [disabled]="!isEditing()" (ionItemReorder)="handleReorder($event)">
        @if (list.length === 0) {
          <ion-item>
            <ion-label>
              <p>{{ 'tabs.training.workout.empty-list' | translate }}</p>
            </ion-label>
          </ion-item>
        } @else {
          @for (item of list; track item.listId) {
            <ion-item-sliding #slidingItem [disabled]="!isEditing()">
              @if (item.type === 'HEADER') {
                <ion-item-options side="start">
                  <ion-item-option
                    color="medium"
                    (click)="openChangeNameModal(item.name!, item.listId, slidingItem)"
                  >
                    {{ 'tabs.training.workout.actions.change-text.title' | translate }}
                  </ion-item-option>
                </ion-item-options>

                <ion-item>
                  <ion-label class="label-item">{{ item.name }}</ion-label>
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
              } @else if (item.type === 'EXERCISE') {
                <ion-item
                  [button]="!isEditing()"
                  [routerLink]="!isEditing() ? [item.itemId, item.name, 'log'] : null"
                  [detail]="!isEditing()"
                >
                  <app-exercise-item [exercise]="item.name!" />
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
              } @else if (item.type === 'SPACER') {
                <ion-item>
                  <ion-icon aria-hidden="true" slot="start"></ion-icon>
                  <ion-label></ion-label>
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
              }
              <ion-item-options side="end">
                <ion-item-option color="danger" (click)="deleteItem(item, slidingItem)">
                  {{ 'general.delete' | translate }}
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          }
        }
      </ion-reorder-group>
    </ion-list>
  `,
})
export class WorkoutListComponent {
  readonly workout = input.required<Workout>();
  readonly save = output<{ message: string; data: ListItem }>();
  readonly workoutList = viewChild.required(IonList);

  private readonly modalCtrl = inject(ModalController);
  private readonly translate = inject(TranslateService);
  private readonly loadingCtrl = inject(LoadingController);
  readonly alertCtrl = inject(AlertController);
  readonly router = inject(Router);

  private readonly workoutsService = inject(WorkoutsService);
  private readonly helperService = inject(HelperService);
  private readonly editService = inject(IsEditingService);
  readonly isEditing = this.editService.isEditing;

  handleReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const from = event.detail.from;
    const to = event.detail.to;

    const ids = this.editService.editedList() ?? [];
    const items = [...ids];
    const moved = items.splice(from, 1)[0];
    items.splice(to, 0, moved);
    this.editService.editedList.set(items);

    event.detail.complete();
  }

  async openChangeNameModal(
    item: string,
    listId: number,
    slidingItem: IonItemSliding,
  ): Promise<void> {
    try {
      await slidingItem.close();
      const modal = await this.modalCtrl.create({
        component: TextInputDialog,
        componentProps: {
          title: this.translate.instant('tabs.training.workout.actions.change-text.title'),
          label: 'Text',
          placeholder: 'Text',
          value: item,
        },
      });
      await modal.present();

      const { data } = await modal.onDidDismiss<string>();
      if (!data || data === item) return;

      this.save.emit({
        message: 'tabs.training.workout.actions.change-text.process',
        data: { ...this.workout().list.find((w) => w.listId === listId)!, name: data },
      });
    } catch (error) {
      console.error('Change text modal could not be opened:', error);
    }
  }

  async deleteItem(item: ListItem, slidingItem: IonItemSliding): Promise<void> {
    await slidingItem.close();

    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('tabs.training.workout.actions.delete.process'),
      spinner: 'circles',
    });
    await loading.present();

    const workout = this.workout();
    const filtered = workout.list.filter((listItem) => listItem.listId !== item.listId);
    const normalized = this.workoutsService.normalizeWorkoutList(filtered);

    const updatedWorkout = {
      ...workout,
      list: normalized,
    };

    this.workoutsService.updateWorkoutList(updatedWorkout).subscribe({
      next: async (res) => {
        this.editService.editedList.set(res.list);
        await loading.dismiss();
      },
      error: async (err) => {
        console.error('Unexpected fail during delete workout item', err);
        await loading.dismiss();
        await this.helperService.showError('tabs.training.workout.actions.delete.error');
      },
    });
  }
}
