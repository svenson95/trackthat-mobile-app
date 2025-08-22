import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { UserService } from '../../services';

@Component({
  selector: 'app-plans',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    li:not(:last-child) .list-item {
      margin-bottom: 1rem;
    }

    .list-item {
      display: flex;
      flex-direction: column;
    }
  `,
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> Plans </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Plans</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container name="Plans page">
        <ul>
          @for (user of usersResource.value(); track user.email) {
            <li>
              <div class="list-item">
                <span>{{ user.name }}</span>
                <span>{{ user.email }}</span>
                <span>{{ user.weight }}</span>
              </div>
            </li>
          }
          @if (isLoading()) {
            <p>loading ...</p>
          } @else if (hasError()) {
            <p>Fehler aufgetreten: {{ hasError() }}</p>
          }
        </ul>
      </app-content-container>
    </ion-content>
  `,
})
export class PlansPage {
  usersService = inject(UserService);
  usersResource = resource({
    loader: async () => firstValueFrom(this.usersService.getUsers()),
  });
  isLoading = computed(() => this.usersResource.status() === 'loading');
  hasError = computed(() => this.usersResource.status() === 'error');
}
