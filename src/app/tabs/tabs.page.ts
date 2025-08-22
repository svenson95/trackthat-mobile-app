import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="activity" href="/tabs/activity" #activityBtn>
          <ion-icon
            aria-hidden="true"
            [name]="activityBtn.selected ? 'bicycle' : 'bicycle-outline'"
          ></ion-icon>
          <ion-label>Activity</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="eat" href="/tabs/eat" #eatBtn>
          <ion-icon
            aria-hidden="true"
            [name]="eatBtn.selected ? 'fast-food' : 'fast-food-outline'"
          ></ion-icon>
          <ion-label>Eat</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="home" href="/tabs/home" #homeBtn>
          <ion-icon
            aria-hidden="true"
            [name]="homeBtn.selected ? 'apps' : 'apps-outline'"
          ></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="logs" href="/tabs/logs" #logsBtn>
          <ion-icon
            aria-hidden="true"
            [name]="logsBtn.selected ? 'calendar' : 'calendar-outline'"
          ></ion-icon>
          <ion-label>Logs</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="more" href="/tabs/more" #moreBtn>
          <ion-icon
            aria-hidden="true"
            [name]="moreBtn.selected ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline'"
          ></ion-icon>
          <ion-label>More</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {}
