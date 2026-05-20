import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '../shared';

@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, TranslateModule],
  template: `
    <ion-tabs (ionTabsDidChange)="setCurrentTab($event.tab)">
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="training" href="/tabs/training" [disabled]="!isLoggedIn()">
          <ion-icon aria-hidden="true" [name]="trainingIcon()"></ion-icon>
          <ion-label>{{ 'tabs.training.tab-label' | translate }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="eat" href="/tabs/eat" [disabled]="!isLoggedIn()">
          <ion-icon aria-hidden="true" [name]="eatIcon()"></ion-icon>
          <ion-label>{{ 'tabs.eat.tab-label' | translate }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="overview" href="/tabs/overview">
          <ion-icon aria-hidden="true" [name]="overviewIcon()"></ion-icon>
          <ion-label>{{ 'tabs.overview.tab-label' | translate }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="logs" href="/tabs/logs" [disabled]="!isLoggedIn()">
          <ion-icon aria-hidden="true" [name]="logsIcon()"></ion-icon>
          <ion-label>{{ 'tabs.logs.tab-label' | translate }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="more" href="/tabs/more" [disabled]="!isLoggedIn()">
          <ion-icon aria-hidden="true" name="ellipsis-horizontal"></ion-icon>
          <ion-label>{{ 'tabs.more.tab-label' | translate }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {
  private authService = inject(AuthService);
  isLoggedIn = this.authService.isLoggedIn;

  private selected = signal('overview');

  trainingIcon = computed(() => (this.selected() === 'training' ? 'bicycle' : 'bicycle-outline'));
  eatIcon = computed(() => (this.selected() === 'eat' ? 'restaurant' : 'restaurant-outline'));
  overviewIcon = computed(() => (this.selected() === 'overview' ? 'person' : 'person-outline'));
  logsIcon = computed(() => (this.selected() === 'logs' ? 'calendar' : 'calendar-outline'));

  setCurrentTab(tab: string): void {
    this.selected.set(tab);
  }
}
