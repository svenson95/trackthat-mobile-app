import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../../components/explore-container/explore-container.module';

import { PlansPage } from './plans.page';

describe('PlansPage', () => {
  let component: PlansPage;
  let fixture: ComponentFixture<PlansPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlansPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PlansPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
