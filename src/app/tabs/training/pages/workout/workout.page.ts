import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonPopover,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { ContentContainerComponent } from '../../../../components';
import type { WorkoutDoc } from '../../../../models';
import { UserService } from '../../../../services';
import { SortingItemsService } from '../../services';

import { WorkoutUnitsComponent } from './components';
import { AddItemDialog } from './dialogs';

const ANGULAR_MODULES = [FormsModule];

const ION_COMPONENTS = [
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonBackButton,
  IonPopover,
  IonList,
  IonItem,
  IonIcon,
  IonTitle,
  IonContent,
];

@Component({
  selector: 'app-workout-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...ANGULAR_MODULES,
    ...ION_COMPONENTS,
    ContentContainerComponent,
    WorkoutUnitsComponent,
    AddItemDialog,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          @if (isEditing()) {
            <ion-button (click)="abortEditing(workoutComp.workoutList())"> Abbrechen </ion-button>
          } @else {
            <ion-back-button text="Pläne" defaultHref="/tabs/training"></ion-back-button>
          }
        </ion-buttons>

        <ion-title> {{ workout.name }} </ion-title>

        <ion-buttons slot="primary">
          <ion-button>
            @if (isEditing()) {
              <ion-button (click)="saveEdit()"> Speichern </ion-button>
            } @else {
              <ion-button (click)="presentPopover($event)">
                <ion-icon
                  slot="icon-only"
                  ios="ellipsis-horizontal"
                  md="ellipsis-vertical"
                ></ion-icon>
              </ion-button>
            }
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" color="light">
      <app-content-container>
        <app-workout-list [workout]="workout" #workoutComp />
      </app-content-container>

      <app-add-item-dialog></app-add-item-dialog>

      <ion-popover #moreMenu [isOpen]="isMoreMenuOpen()" (didDismiss)="isMoreMenuOpen.set(false)">
        <ng-template>
          <ion-list>
            <ion-item [button]="true" [detail]="false" lines="none" (click)="startEditing()">
              Bearbeiten
            </ion-item>
          </ion-list>
        </ng-template>
      </ion-popover>
    </ion-content>
  `,
})
export class WorkoutPage {
  private route = inject(ActivatedRoute);

  private sortService = inject(SortingItemsService);
  isEditing = this.sortService.isEditing;

  private userService = inject(UserService);
  private loadingCtrl = inject(LoadingController);

  private moreMenu = viewChild.required<HTMLIonPopoverElement>('moreMenu');
  isMoreMenuOpen = signal<boolean>(false);

  workout: WorkoutDoc = this.route.snapshot.data['workout'];

  presentPopover(ev: Event): void {
    this.moreMenu().event = ev;
    this.isMoreMenuOpen.set(true);
  }

  startEditing(): void {
    this.isEditing.set(true);
    void this.moreMenu().dismiss();
  }

  async abortEditing(list: IonList): Promise<void> {
    await list.closeSlidingItems();
    this.isEditing.set(false);
  }

  async saveEdit(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Sortierung wird gespeichert ...',
      spinner: 'circles',
    });
    await loading.present();

    const ids = this.sortService.itemIds();
    const userId = this.userService.user().id;

    this.isEditing.set(false);
    void loading.dismiss();
    // TODO: change to updateWorkoutItemList(workoutId, ids)
    // this.userService.updateUserWorkoutList(userId, ids).subscribe({
    //   next: () => {
    //     this.isEditing.set(false);
    //     void loading.dismiss();
    //   },
    //   error: (err) => {
    //     console.error('Unexpected fail during update user.workoutIds', err);
    //     this.isEditing.set(false);
    //     void loading.dismiss();
    //   },
    // });
  }
}
