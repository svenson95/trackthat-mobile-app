import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { ContentContainerComponent } from '../../../../components';
import type { WorkoutDoc } from '../../../../models';

import { WorkoutUnitsComponent } from './components';

const ANGULAR_MODULES = [FormsModule];

const ION_COMPONENTS = [
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
  IonTitle,
  IonContent,
];

@Component({
  selector: 'app-workout-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...ANGULAR_MODULES,
    ...ION_COMPONENTS,
    ContentContainerComponent,
    WorkoutUnitsComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button text="Pläne" defaultHref="/tabs/training"></ion-back-button>
        </ion-buttons>

        <ion-title> {{ workout.name }} </ion-title>

        <ion-buttons slot="primary">
          <ion-button>
            <ion-icon slot="icon-only" ios="ellipsis-horizontal" md="ellipsis-vertical"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" color="light">
      <app-content-container>
        <app-workout-units [workout]="workout" />
      </app-content-container>
    </ion-content>
  `,
})
export class WorkoutDetailPage {
  private route = inject(ActivatedRoute);

  workout: WorkoutDoc = this.route.snapshot.data['workout'];
}
