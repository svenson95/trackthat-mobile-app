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
  IonListHeader,
  IonReorder,
  IonReorderGroup,
} from '@ionic/angular/standalone';

import type { Workout } from '../../../../../models';
import { EXERCISES_METADATA } from '../../../../../shared';
import { SortingItemsService } from '../../../services';

const ION_COMPONENTS = [
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonListHeader,
  IonReorder,
  IonReorderGroup,
  IonItemSliding,
];

@Component({
  selector: 'app-workout-units',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS],
  styles: `
    .exercise-image {
      margin-right: 0.5rem;
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
                <ion-list-header lines="inset">
                  <ion-label>{{ item.name }}</ion-label>
                  <ion-reorder slot="end"></ion-reorder>
                </ion-list-header>
              } @else if (item.type === 'EXERCISE') {
                <ion-item button>
                  @if (exerciseWithImage(item.name)) {
                    <img
                      class="exercise-image"
                      [src]="'assets/images/exercises' + darkPath() + '/' + item.name + '.png'"
                      width="24"
                      height="24"
                    />
                  }
                  <ion-label>{{ item.name }}</ion-label>
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
              } @else if (item.type === 'LABEL') {
                <ion-item button>
                  <ion-icon aria-hidden="true" slot="start"></ion-icon>
                  <ion-label>{{ item.name }}</ion-label>
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
              } @else if (item.type === 'SPACER') {
                <ion-item button>
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
  itemsList = viewChild.required(IonList);

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

  exerciseWithImage(name: null | string): boolean {
    if (!name) return false;
    return EXERCISES_METADATA.some((e) => e.name === name && !!e.image);
  }
}
