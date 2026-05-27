import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, LoadingController } from '@ionic/angular';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ContentContainerComponent } from '../../shared/components';
import { AuthService, UserService } from '../../shared/services';

import { UsersService } from './services';

@Component({
  selector: 'app-more-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, ContentContainerComponent, TranslateModule],
  providers: [UsersService],
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
        <ion-title> {{ 'tabs.more.tab-title' | translate }} </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" color="light">
      <ion-header collapse="condense">
        <ion-toolbar color="light">
          <ion-title size="large">{{ 'tabs.more.tab-title' | translate }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container name="More page">
        <ion-list [inset]="true">
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ 'tabs.more.settings.label' | translate }}</ion-label>
            </ion-item-divider>

            <ion-item button (click)="logout()" detail="true">
              <ion-label>{{ 'tabs.more.settings.sign-off' | translate }}</ion-label>
            </ion-item>

            <ion-item>
              <ion-select
                [label]="'tabs.more.settings.language.label' | translate"
                [value]="currentLanguage"
                (ionChange)="changeLanguage($event.detail.value)"
                [cancelText]="'general.abort' | translate"
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

        <ion-list [inset]="true" lines="none">
          <ion-item-group>
            <ion-item-divider>
              <ion-label>{{ 'tabs.more.user.label' | translate }}</ion-label>
            </ion-item-divider>

            @if (isResolved()) {
              @for (user of allUsers.value(); track user.email) {
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
      </app-content-container>
    </ion-content>
  `,
})
export class MorePage {
  private readonly router = inject(Router);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly translate = inject(TranslateService);

  private readonly userService = inject(UserService);
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);

  readonly currentLanguage = this.userService.currentLanguage;

  readonly allUsers = this.usersService.allUsersResource;
  readonly isLoading = computed(() => this.allUsers.status() === 'loading');
  readonly isResolved = computed(() => this.allUsers.status() === 'resolved');
  readonly hasError = computed(() => this.allUsers.status() === 'error');

  async logout(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Du wirst abgemeldet ...',
      spinner: 'circles',
    });
    await loading.present();

    this.authService.logout();
    await this.router.navigate(['/tabs/overview']);

    await loading.dismiss();
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }
}
