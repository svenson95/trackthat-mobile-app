import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContentContainerComponent } from '../../components';

import { LogsPage } from './logs.page';

describe('LogsPage', () => {
  let component: LogsPage;
  let fixture: ComponentFixture<LogsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LogsPage],
      imports: [IonicModule.forRoot(), ContentContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
