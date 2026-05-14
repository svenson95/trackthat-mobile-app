import type { OnDestroy, OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { type ItemReorderEventDetail } from '@ionic/angular';
import {
  IonIcon,
  IonItem,
  IonItemSliding,
  IonLabel,
  IonList,
  IonReorder,
  IonReorderGroup,
} from '@ionic/angular/standalone';

import type { Workout } from '../../../../../models';
import { SortingItemsService } from '../../../services';

const ION_COMPONENTS = [
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonReorder,
  IonReorderGroup,
  IonItemSliding,
];

@Component({
  selector: 'app-workout-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS],
  styles: `
    .exercise-image {
      margin-right: 0.5rem;
    }
    .label-item {
      font-weight: 700;
    }
  `,
  template: `
    @let list = workout().list;
    @if (list.length === 0) {
      <ion-list [inset]="true">
        <ion-item disabled>
          <ion-label>
            <p>Keine Trainingseinheiten</p>
          </ion-label>
        </ion-item>
      </ion-list>
    } @else {
      <ion-list [inset]="true">
        <ion-reorder-group [disabled]="!isEditing()" (ionItemReorder)="handleReorder($event)">
          @for (item of list; track item.name) {
            <ion-item-sliding [disabled]="!isEditing()">
              @if (item.type === 'HEADER') {
                <ion-item>
                  <ion-label class="label-item">{{ item.name }}</ion-label>
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
              } @else if (item.type === 'EXERCISE') {
                <ion-item [button]="!isEditing()">
                  <img
                    class="exercise-image"
                    [src]="'assets/images/exercises' + darkPath() + '/' + item.name + '.png'"
                    width="24"
                    height="24"
                  />
                  <ion-label>{{ item.name }}</ion-label>
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
              } @else if (item.type === 'LABEL') {
                <ion-item [button]="!isEditing()">
                  <ion-icon aria-hidden="true" slot="start"></ion-icon>
                  <ion-label>{{ item.name }}</ion-label>
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
              } @else if (item.type === 'SPACER') {
                <ion-item>
                  <ion-icon aria-hidden="true" slot="start"></ion-icon>
                  <ion-label></ion-label>
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
              }
            </ion-item-sliding>
          }
        </ion-reorder-group>
      </ion-list>
    }
  `,
})
export class WorkoutUnitsComponent implements OnInit, OnDestroy {
  workout = input.required<Workout>();
  private editService = inject(SortingItemsService);
  isEditing = this.editService.isEditing;
  workoutList = viewChild.required(IonList);

  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  darkPath = signal(this.mediaQuery.matches ? '-white' : '');

  ngOnInit(): void {
    this.mediaQuery.addEventListener('change', this.darkPathListener);
  }

  ngOnDestroy(): void {
    this.mediaQuery.removeEventListener('change', this.darkPathListener);
  }

  private darkPathListener = (event: MediaQueryListEvent): void => {
    this.darkPath.set(event.matches ? '-white' : '');
  };

  handleReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const from = event.detail.from;
    const to = event.detail.to;

    const items = [...this.editService.itemIds()];
    const moved = items.splice(from, 1)[0];
    items.splice(to, 0, moved);
    this.editService.itemIds.set(items);

    event.detail.complete();
  }
}
