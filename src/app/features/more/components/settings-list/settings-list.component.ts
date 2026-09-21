import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import type { SupportedLanguage } from '../../../../core';

const ION_COMPONENTS = [
  IonList,
  IonItemGroup,
  IonItemDivider,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
];

@Component({
  selector: 'app-settings-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, TranslateModule],
  template: `
    <ion-list [inset]="true">
      <ion-item-group>
        <ion-item-divider>
          <ion-label>{{ 'tabs.more.settings.label' | translate }}</ion-label>
        </ion-item-divider>

        <ion-item button detail="true" (click)="logout.emit()">
          <ion-label>{{ 'tabs.more.settings.sign-off.label' | translate }}</ion-label>
        </ion-item>

        <ion-item>
          <ion-select
            [label]="'tabs.more.settings.language.label' | translate"
            [value]="currentLanguage()"
            [cancelText]="'general.abort' | translate"
            (ionChange)="languageChange.emit($event.detail.value)"
          >
            <ion-select-option value="de">
              {{ 'tabs.more.settings.language.german' | translate }}
            </ion-select-option>

            <ion-select-option value="en">
              {{ 'tabs.more.settings.language.english' | translate }}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-item-group>
    </ion-list>
  `,
})
export class SettingsListComponent {
  readonly currentLanguage = input.required<SupportedLanguage>();

  protected readonly logout = output<void>();
  protected readonly languageChange = output<SupportedLanguage>();
}
