import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-content-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-bottom: 2rem;
    }
  `,
  template: ` <ng-content></ng-content> `,
})
export class ContentContainerComponent {}
