import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '../auth';

import type { TabConfig, TabId } from './tab-view.config';
import { TABS } from './tab-view.config';

const IONIC_COMPONENTS = [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel];

@Component({
  selector: 'app-tab-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...IONIC_COMPONENTS, TranslateModule],
  template: `
    <ion-tabs (ionTabsDidChange)="selectTab($event.tab)">
      <ion-tab-bar slot="bottom">
        @for (tab of tabs; track tab.id) {
          <ion-tab-button
            [tab]="tab.id"
            [href]="'/tabs/' + tab.id"
            [disabled]="tab.requiresAuth && !isLoggedIn()"
          >
            <ion-icon aria-hidden="true" [name]="getIcon(tab)"></ion-icon>

            <ion-label>
              {{ 'tabs.' + tab.id + '.tab-label' | translate }}
            </ion-label>
          </ion-tab-button>
        }
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabViewComponent {
  private readonly authService = inject(AuthService);

  protected readonly tabs = TABS;
  protected readonly isLoggedIn = this.authService.isLoggedIn;

  private readonly selectedTab = signal<TabId>('overview');

  protected selectTab(tab: string): void {
    if (this.isTabId(tab)) {
      this.selectedTab.set(tab);
    }
  }

  protected getIcon(tab: TabConfig): string {
    if (this.selectedTab() === tab.id) {
      return tab.activeIcon ?? tab.icon;
    }

    return tab.icon;
  }

  private isTabId(tab: string): tab is TabId {
    return this.tabs.some(({ id }) => id === tab);
  }
}
