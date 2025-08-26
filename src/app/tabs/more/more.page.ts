import { ChangeDetectionStrategy, Component, computed, inject, resource } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { ContentContainerComponent } from '../../components';
import { AuthService, UserService } from '../../services';

@Component({
  selector: 'app-more-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, ContentContainerComponent],
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
        <ion-title> Mehr </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Mehr</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container name="More page">
        <ion-list>
          <ion-item-group>
            <ion-item-divider>
              <ion-label>Einstellungen</ion-label>
            </ion-item-divider>

            <ion-item button (click)="logout()" detail="true" lines="none">
              <ion-label>Abmelden</ion-label>
            </ion-item>
          </ion-item-group>

          <ion-item-group>
            <ion-item-divider>
              <ion-label>Nutzer</ion-label>
            </ion-item-divider>

            @let data = usersResource.value();
            @if (data !== undefined) {
              @for (user of data; track user.email) {
                <ion-item>
                  <ion-label>
                    <h3>{{ user.name }}</h3>
                    <p>{{ user.email }}</p>
                  </ion-label>
                </ion-item>
              }
            } @else if (isLoading()) {
              <ion-item disabled>
                <ion-label>
                  <p>loading ...</p>
                </ion-label>
              </ion-item>
            } @else if (hasError()) {
              <ion-item disabled>
                <ion-label>
                  <p>Fehler aufgetreten</p>
                </ion-label>
              </ion-item>
            }
          </ion-item-group>
        </ion-list>
      </app-content-container>
    </ion-content>
  `,
})
export class MorePage {
  private usersService = inject(UserService);
  private authService = inject(AuthService);

  usersResource = resource({
    loader: async () => firstValueFrom(this.usersService.getUsers()),
  });
  isLoading = computed(() => this.usersResource.status() === 'loading');
  hasError = computed(() => this.usersResource.status() === 'error');

  logout = this.authService.logout;
}
