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
  LoadingController,
  type RefresherCustomEvent,
} from '@ionic/angular';
import { catchError, distinctUntilChanged, filter, first, of, pairwise, timeout } from 'rxjs';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { UserService } from '../../../core';
import { IonicUiService } from '../../../shared';

import { WorkoutsService } from '../data-access';

import { WorkoutsListComponent } from './components';
import { AddWorkoutDialog } from './dialogs';
import { WorkoutsEditorState } from './workouts-editor.state';

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
    WorkoutsListComponent,
    AddWorkoutDialog,
  ],
  providers: [WorkoutsEditorState],
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

        <ion-title>{{ 'tabs.training.tab-title' | translate }}</ion-title>

        <ion-buttons slot="primary">
          @if (isEditing()) {
            <ion-button (click)="saveEdit()">
              {{ 'general.save' | translate }}
            </ion-button>
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

      <div class="page-content">
        <app-workouts-list #workoutsComp />
      </div>

      <app-add-workout-dialog />

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
  private readonly ionicUiService = inject(IonicUiService);
  private readonly translate = inject(TranslateService);
  private readonly host = inject(ElementRef<HTMLElement>);

  private readonly userService = inject(UserService);
  private readonly workoutsService = inject(WorkoutsService);
  private readonly editorState = inject(WorkoutsEditorState);

  protected readonly isEditing = this.editorState.isEditing;

  private readonly moreMenu = viewChild.required<HTMLIonPopoverElement>('moreMenu');
  private readonly workoutsComp = viewChild.required(WorkoutsListComponent);
  private readonly addWorkoutDialog = viewChild.required(AddWorkoutDialog);

  protected readonly isMoreMenuOpen = signal<boolean>(false);

  protected handleRefresh(event: RefresherCustomEvent): void {
    const resource = this.workoutsService.workoutsResource;
    const started = resource.reload();

    if (!started && !resource.isLoading()) {
      void event.target.complete();
      return;
    }

    toObservable(resource.isLoading, { injector: this.injector })
      .pipe(
        distinctUntilChanged(),
        pairwise(),
        filter(([wasLoading, isLoading]) => wasLoading && !isLoading),
        first(),
        timeout(10_000),
        catchError(() => of(null)),
      )
      .subscribe(() => {
        void event.target.complete();
      });
  }

  protected async openAddWorkoutModal(): Promise<void> {
    try {
      await this.addWorkoutDialog().modal().present();
    } catch (error) {
      console.error('Add workout modal could not be opened:', error);
    }
  }

  protected presentPopover(event: Event): void {
    this.moreMenu().event = event;
    this.isMoreMenuOpen.set(true);
  }

  protected async startEditing(): Promise<void> {
    this.editorState.start(this.workoutsService.sortedWorkouts());
    await this.moreMenu().dismiss();
  }

  protected async abortEditing(): Promise<void> {
    await this.closeEditingUi();
    this.editorState.cancel();
  }

  protected async saveEdit(): Promise<void> {
    const userId = this.userService.userData()?.id;
    const workouts = this.editorState.draft();

    if (!userId || !workouts) {
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('tabs.training.workouts.actions.update-list.process'),
      spinner: 'circles',
    });

    await loading.present();

    this.workoutsService.updateAllWorkouts(userId, workouts).subscribe({
      next: async () => {
        await this.closeEditingUi();
        await loading.dismiss();

        this.editorState.cancel();
      },
      error: async (error) => {
        console.error('Unexpected fail during update user.workoutIds', error);

        await loading.dismiss();

        await this.ionicUiService.showError('tabs.training.workouts.actions.update-list.error');
      },
    });
  }

  private async closeEditingUi(): Promise<void> {
    await this.workoutsComp().workoutsList().closeSlidingItems();
    await this.ionicUiService.closeSlidingItems(this.host);
  }
}
