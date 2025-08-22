import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContentContainerComponent } from '../../components';
import { TrainingPage } from './training.page';

describe('TrainingPage', () => {
  let component: TrainingPage;
  let fixture: ComponentFixture<TrainingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrainingPage],
      imports: [IonicModule.forRoot(), ContentContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
