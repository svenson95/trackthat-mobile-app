import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonLabel } from '@ionic/angular/standalone';

import { TranslateModule } from '@ngx-translate/core';

const ION_COMPONENTS = [IonLabel];

@Component({
  selector: 'app-log-workout-inputs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, TranslateModule],
  styles: `
    :host {
      display: flex;
      align-items: center;
    }
    .exercise-image {
      margin-right: 0.75rem;
    }
  `,
  template: ` <ion-label> TEST </ion-label> `,
})
export class LogWorkoutInputsComponent {}
