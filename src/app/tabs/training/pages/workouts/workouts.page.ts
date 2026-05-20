import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonPopover,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import type { RefresherCustomEvent } from '@ionic/core';
import { catchError, distinctUntilChanged, filter, first, of, pairwise, timeout } from 'rxjs';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ContentContainerComponent } from '../../../../components';
import { HelperService, UserService } from '../../../../services';
import { IsEditingService, WorkoutsService } from '../../services';

import { WorkoutsListComponent } from './components';
import { AddWorkoutDialog } from './dialogs';

const ION_COMPONENTS = [
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonPopover,
  IonList,
  IonItem,
  IonRefresher,
  IonRefresherContent,
];

@Component({
  selector: 'app-workouts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...ION_COMPONENTS,
    TranslateModule,
    FormsModule,
    ContentContainerComponent,
    WorkoutsListComponent,
    AddWorkoutDialog,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          @if (isEditing()) {
            <ion-button (click)="abortEditing()">
              {{ 'general.abort' | translate }}
            </ion-button>
          } @else {
            <ion-button (click)="openAddWorkoutModal()">
              <ion-icon slot="icon-only" ios="add" md="add"></ion-icon>
            </ion-button>
          }
        </ion-buttons>

        <ion-title> {{ 'tabs.training.tab-title' | translate }} </ion-title>

        <ion-buttons slot="primary">
          @if (isEditing()) {
            <ion-button (click)="saveEdit()"> {{ 'general.save' | translate }} </ion-button>
          } @else {
            <ion-button (click)="presentPopover($event)">
              <ion-icon
                slot="icon-only"
                ios="ellipsis-horizontal"
                md="ellipsis-vertical"
              ></ion-icon>
            </ion-button>
          }
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" color="light">
      <ion-refresher slot="fixed" [pullFactor]="1.5" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content
          pullingIcon="chevron-down"
          [pullingText]="('general.loading' | translate) + '...'"
          refreshingSpinner="circles"
          [refreshingText]="('general.loading' | translate) + '...'"
        ></ion-refresher-content>
      </ion-refresher>

      <ion-header collapse="condense">
        <ion-toolbar color="light">
          <ion-title size="large">{{ 'tabs.training.tab-title' | translate }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container>
        <app-workouts-list #workoutsComp />
      </app-content-container>

      <app-add-workout-dialog></app-add-workout-dialog>

      <ion-popover #moreMenu [isOpen]="isMoreMenuOpen()" (didDismiss)="isMoreMenuOpen.set(false)">
        <ng-template>
          <ion-list>
            <ion-item button [detail]="false" lines="none" (click)="startEditing()">
              {{ 'general.edit' | translate }}
            </ion-item>
          </ion-list>
        </ng-template>
      </ion-popover>
    </ion-content>
  `,
})
export class WorkoutsPage {
  private readonly injector = inject(Injector);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly helperService = inject(HelperService);
  private readonly translate = inject(TranslateService);
  private readonly host = inject(ElementRef<HTMLElement>);

  private readonly userService = inject(UserService);
  private readonly workoutsService = inject(WorkoutsService);

  private readonly moreMenu = viewChild.required<HTMLIonPopoverElement>('moreMenu');
  private readonly workoutsComp = viewChild.required(WorkoutsListComponent);
  readonly isMoreMenuOpen = signal<boolean>(false);

  private readonly editService = inject(IsEditingService);
  readonly isEditing = this.editService.isEditing;

  private readonly addWorkoutDialog = viewChild.required(AddWorkoutDialog);

  handleRefresh(event: RefresherCustomEvent): void {
    const res = this.workoutsService.workoutsResource;
    const started = res.reload();

    if (!started && !res.isLoading()) {
      void event.target.complete();
      return;
    }

    toObservable(res.isLoading, { injector: this.injector })
      .pipe(
        distinctUntilChanged(),
        pairwise(),
        filter(([wasLoading, isLoading]) => wasLoading && !isLoading),
        first(),
        timeout(10000),
        catchError(() => of(null)),
      )
      .subscribe(() => {
        void event.target.complete();
      });
  }

  async openAddWorkoutModal(): Promise<void> {
    try {
      const dialog = this.addWorkoutDialog();
      const modal = dialog.modal();

      await modal.present();
    } catch (error) {
      console.error('Add workout modal could not be opened:', error);
    }
  }

  presentPopover(ev: Event): void {
    this.moreMenu().event = ev;
    this.isMoreMenuOpen.set(true);
  }

  async startEditing(): Promise<void> {
    this.editService.editedWorkouts.set(structuredClone(this.workoutsService.sortedWorkouts()));
    this.isEditing.set(true);
    await this.moreMenu().dismiss();
  }

  async abortEditing(): Promise<void> {
    await this.workoutsComp().workoutsList().closeSlidingItems();
    await this.helperService.closeSlidingItems(this.host);
    this.editService.editedWorkouts.set(null);
    this.isEditing.set(false);
  }

  async saveEdit(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('tabs.training.workouts.actions.update-list.process'),
      spinner: 'circles',
    });
    await loading.present();

    const workouts = this.editService.editedWorkouts()!;
    const userId = this.userService.user().id;

    this.workoutsService.updateAllWorkouts(userId, workouts).subscribe({
      next: async () => {
        await this.helperService.closeSlidingItems(this.host);
        await loading.dismiss();
        this.isEditing.set(false);
        this.editService.editedWorkouts.set(null);
      },
      error: async (err) => {
        console.error('Unexpected fail during update user.workoutIds', err);
        await this.helperService.closeSlidingItems(this.host);
        await loading.dismiss();
        this.isEditing.set(false);
        this.editService.editedWorkouts.set(null);
        await this.helperService.showError('tabs.training.workouts.actions.update-list.error');
      },
    });
  }
}
