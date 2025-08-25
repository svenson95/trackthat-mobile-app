import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  viewChild,
} from '@angular/core';
import { IonTabBar, IonicModule } from '@ionic/angular';

import { AuthService } from '../services';

@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule],
  template: `
    <ion-tabs #tabs (ionTabsDidChange)="setCurrentTab(tabs.getSelected()!)">
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="training" href="/tabs/training" [disabled]="!isLoggedIn()">
          <ion-icon aria-hidden="true" [name]="trainingIcon()"></ion-icon>
          <ion-label>Training</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="eat" href="/tabs/eat" [disabled]="!isLoggedIn()">
          <ion-icon aria-hidden="true" [name]="eatIcon()"></ion-icon>
          <ion-label>Eat</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="overview" href="/tabs/overview">
          <ion-icon aria-hidden="true" [name]="overviewIcon()"></ion-icon>
          <ion-label>Überblick</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="logs" href="/tabs/logs" [disabled]="!isLoggedIn()">
          <ion-icon aria-hidden="true" [name]="logsIcon()"></ion-icon>
          <ion-label>Logs</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="more" href="/tabs/more" [disabled]="!isLoggedIn()">
          <ion-icon aria-hidden="true" [name]="moreIcon()"></ion-icon>
          <ion-label>More</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {
  private authService = inject(AuthService);
  private tabBar = viewChild.required(IonTabBar);
  private selected = linkedSignal(() => this.tabBar()?.selectedTab ?? 'home');

  isLoggedIn = this.authService.isLoggedIn;

  trainingIcon = computed(() => (this.selected() === 'training' ? 'bicycle' : 'bicycle-outline'));
  eatIcon = computed(() => (this.selected() === 'eat' ? 'restaurant' : 'restaurant-outline'));
  overviewIcon = computed(() => (this.selected() === 'overview' ? 'person' : 'person-outline'));
  logsIcon = computed(() => (this.selected() === 'logs' ? 'calendar' : 'calendar-outline'));
  moreIcon = computed(() =>
    this.selected() === 'more' ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline',
  );

  setCurrentTab(tab: string): void {
    this.selected.set(tab);
  }
}
