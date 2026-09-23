import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import type { UserDoc } from '../../../../core';

const IONIC_COMPONENTS = [IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList];

@Component({
  selector: 'app-hello-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...IONIC_COMPONENTS, RouterLink, TranslateModule],
  styles: `
    ion-list[inset] {
      border-radius: var(--app-border-radius, 12px);
      overflow: hidden;
    }

    .workout-name {
      font-weight: 600;
    }

    .weight-chart {
      width: 100%;
      height: 120px;
      display: block;
    }

    .weight-chart polyline {
      fill: none;
      stroke: var(--ion-color-primary);
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .weight-chart line {
      stroke: var(--ion-border-color);
      stroke-width: 1;
    }

    .weight-summary {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      color: var(--ion-color-medium);
      font-size: 0.875rem;
    }
  `,
  template: `
    <ion-list [inset]="true">
      <ion-item-group>
        <ion-item-divider>
          <ion-label>Nächstes Training</ion-label>
        </ion-item-divider>

        <ion-item button detail="true" lines="none" [routerLink]="['/tabs/training']">
          <ion-label>
            <h2 class="workout-name">Brust Trizeps</h2>
            <p>5er-Split + Supersets</p>
          </ion-label>
        </ion-item>
      </ion-item-group>
    </ion-list>

    <ion-list [inset]="true" lines="none">
      <ion-item-group>
        <ion-item-divider>
          <ion-label>Gewicht</ion-label>
        </ion-item-divider>

        <ion-item>
          <ion-label>
            <svg
              class="weight-chart"
              viewBox="0 0 300 100"
              preserveAspectRatio="none"
              role="img"
              aria-label="Gewichtsverlauf im aktuellen Monat"
            >
              <line x1="0" y1="25" x2="300" y2="25" />
              <line x1="0" y1="50" x2="300" y2="50" />
              <line x1="0" y1="75" x2="300" y2="75" />

              <polyline
                points="
                  0,25
                  45,32
                  90,30
                  135,45
                  180,52
                  225,58
                  270,70
                  300,66
                "
              />
            </svg>

            <div class="weight-summary">
              <span>1. Sep.</span>
              <span>110,0 → 108,6 kg</span>
              <span>Heute</span>
            </div>
          </ion-label>
        </ion-item>
      </ion-item-group>
    </ion-list>
  `,
})
export class HelloBoxComponent {
  readonly user = input.required<UserDoc>();
}
