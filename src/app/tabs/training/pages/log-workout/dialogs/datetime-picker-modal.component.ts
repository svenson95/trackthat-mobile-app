import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import type { DatetimeCustomEvent } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { IonButton, IonButtons, IonDatetime } from '@ionic/angular/standalone';

type PickerKind = 'date' | 'time';

@Component({
  selector: 'app-datetime-picker-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonButtons, IonDatetime],
  styles: `
    :host {
      display: block;
    }

    ion-datetime {
      width: 100%;
      --background: var(--ion-background-color);
    }
  `,
  template: `
    <ion-datetime
      #datetime
      [presentation]="kind"
      [value]="selectedValue()"
      locale="de-DE"
      mode="ios"
      size="cover"
      first-day-of-week="1"
      [preferWheel]="kind === 'date'"
      (ionChange)="onChange($event)"
    >
      <ion-buttons slot="buttons">
        <ion-button type="button" (click)="reset(datetime)">
          {{ kind === 'time' ? 'Jetzt' : 'Heute' }}
        </ion-button>

        <ion-button type="button" (click)="cancel()">Abbrechen</ion-button>

        <ion-button type="button" strong="true" (click)="confirm(datetime)"> Fertig </ion-button>
      </ion-buttons>
    </ion-datetime>
  `,
})
export class DatetimePickerModalComponent implements OnInit {
  @Input({ required: true }) kind!: PickerKind;
  @Input({ required: true }) value!: string;
  @Input({ required: true }) resetValue!: string;

  private readonly modalController = inject(ModalController);

  readonly selectedValue = signal<string | null>(null);

  ngOnInit(): void {
    this.selectedValue.set(this.value);
  }

  onChange(event: DatetimeCustomEvent): void {
    const value = event.detail.value;
    if (typeof value !== 'string') return;
    const timeIndex = value.indexOf('T');
    const time = value.substring(timeIndex + 1, timeIndex + 9);
    this.selectedValue.set(time);
  }

  cancel(): void {
    void this.modalController.dismiss(null, 'cancel');
  }

  reset(datetime: IonDatetime): void {
    this.selectedValue.set(this.resetValue);
    void datetime.reset(this.resetValue);
    void this.modalController.dismiss(this.resetValue, 'confirm');
  }

  async confirm(datetime: IonDatetime): Promise<void> {
    await datetime.confirm();
    await this.modalController.dismiss(this.selectedValue(), 'confirm');
  }
}
