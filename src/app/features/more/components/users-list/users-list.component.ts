import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import type { GetUsersResponse } from '../../../../core';

const ION_COMPONENTS = [IonList, IonItemGroup, IonItemDivider, IonItem, IonLabel];

@Component({
  selector: 'app-users-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, TranslateModule],
  styles: `
    .list-ios.list-inset {
      margin-top: 0;
    }
  `,
  template: `
    <ion-list [inset]="true" lines="none">
      <ion-item-group>
        <ion-item-divider>
          <ion-label>{{ 'tabs.more.user.label' | translate }}</ion-label>
        </ion-item-divider>

        @if (isResolved()) {
          @for (user of users(); track user.email) {
            <ion-item>
              <ion-label>
                <h3>{{ user.name }}</h3>
                <p>{{ user.email }}</p>
              </ion-label>
            </ion-item>
          }
        } @else if (isLoading()) {
          <ion-item>
            <ion-label>
              <p>{{ 'general.loading' | translate }} ...</p>
            </ion-label>
          </ion-item>
        } @else if (hasError()) {
          <ion-item>
            <ion-label>
              <p>{{ 'general.error' | translate }}</p>
            </ion-label>
          </ion-item>
        }
      </ion-item-group>
    </ion-list>
  `,
})
export class UsersListComponent {
  readonly users = input.required<GetUsersResponse>();
  readonly isLoading = input.required<boolean>();
  readonly isResolved = input.required<boolean>();
  readonly hasError = input.required<boolean>();
}
