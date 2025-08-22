import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContentContainerComponent } from '../../components';
import { EatPage } from './eat.page';

describe('EatPage', () => {
  let component: EatPage;
  let fixture: ComponentFixture<EatPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EatPage],
      imports: [IonicModule.forRoot(), ContentContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
