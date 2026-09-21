import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, LoadingController } from '@ionic/angular';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService, type SupportedLanguage, UserService } from '../../core';

import { SettingsListComponent, UsersListComponent } from './components';
import { UsersService } from './data-access';

const ION_COMPONENTS = [IonContent, IonHeader, IonTitle, IonToolbar];

@Component({
  selector: 'app-more-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, TranslateModule, SettingsListComponent, UsersListComponent],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>{{ 'tabs.more.tab-title' | translate }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">
            {{ 'tabs.more.tab-title' | translate }}
          </ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="page-content">
        <app-settings-list
          [currentLanguage]="currentLanguage()"
          (logout)="logout()"
          (languageChange)="setLanguage($event)"
        />

        <app-users-list
          [users]="allUsers.value() ?? []"
          [isLoading]="isLoading()"
          [isResolved]="isResolved()"
          [hasError]="hasError()"
        />
      </div>
    </ion-content>
  `,
})
export class MorePage {
  private readonly router = inject(Router);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly translate = inject(TranslateService);

  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly usersService = inject(UsersService);

  protected readonly currentLanguage = this.userService.currentLanguage;

  protected readonly allUsers = this.usersService.allUsersResource;

  protected readonly isLoading = computed<boolean>(() => this.allUsers.status() === 'loading');
  protected readonly isResolved = computed<boolean>(() => this.allUsers.status() === 'resolved');
  protected readonly hasError = computed<boolean>(() => this.allUsers.status() === 'error');

  protected setLanguage(language: SupportedLanguage): void {
    this.userService.setLanguage(language);
  }

  protected async logout(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: this.translate.instant('tabs.more.settings.sign-off.process'),
      spinner: 'circles',
    });

    await loading.present();

    try {
      this.authService.logout();
      await this.router.navigate(['/tabs/overview']);
    } finally {
      await loading.dismiss();
    }
  }
}
