import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

const IONIC_COMPONENTS = [
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
];

type Supplement = {
  name: string;
  taken: boolean;
};

@Component({
  selector: 'app-body-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...IONIC_COMPONENTS, TranslateModule],
  styles: ``,
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Gesundheit</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Gesundheit</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="page-content">
        <ion-list [inset]="true">
          <ion-item-group>
            <ion-item-divider>
              <ion-label>Gewicht</ion-label>
            </ion-item-divider>

            <ion-item lines="none">
              <ion-input
                label="Heutiges Gewicht"
                labelPlacement="stacked"
                type="number"
                inputmode="decimal"
                placeholder="110,0"
                [value]="weight()"
                (ionInput)="weight.set($event.detail.value ?? '')"
              />

              <ion-label slot="end">kg</ion-label>
            </ion-item>
          </ion-item-group>
        </ion-list>

        <ion-list [inset]="true">
          <ion-item-group>
            <ion-item-divider>
              <ion-label>Supplements</ion-label>
            </ion-item-divider>

            @for (supplement of supplements(); track supplement.name; let index = $index) {
              <ion-item>
                <ion-checkbox
                  justify="space-between"
                  [checked]="supplement.taken"
                  (ionChange)="setSupplementTaken(index, $event.detail.checked)"
                >
                  {{ supplement.name }}
                </ion-checkbox>
              </ion-item>
            }
          </ion-item-group>
        </ion-list>
      </div>
    </ion-content>
  `,
})
export class BodyPage {
  protected readonly weight = signal('');

  protected readonly supplements = signal<Supplement[]>([
    { name: 'Kreatin', taken: false },
    { name: 'Vitamin D', taken: false },
    { name: 'Magnesium', taken: false },
  ]);

  protected setSupplementTaken(index: number, taken: boolean): void {
    this.supplements.update((supplements) =>
      supplements.map((supplement, currentIndex) =>
        currentIndex === index ? { ...supplement, taken } : supplement,
      ),
    );
  }
}
