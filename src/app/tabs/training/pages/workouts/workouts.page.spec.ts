import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { addIcons } from 'ionicons';
import { add, ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';

import { ContentContainerComponent } from '../../../../components';
import { USER_MOCK } from '../../../../test-mocks/user.mock';

import { WorkoutsPage } from './workouts.page';

describe('WorkoutsPage', () => {
  let component: WorkoutsPage;
  let fixture: ComponentFixture<WorkoutsPage>;

  beforeEach(async () => {
    localStorage.setItem('user', JSON.stringify(USER_MOCK));
    addIcons({
      'ellipsis-vertical': ellipsisVertical,
      'ellipsis-horizontal': ellipsisHorizontal,
      add,
    });

    await TestBed.configureTestingModule({
      imports: [ContentContainerComponent, WorkoutsPage],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('user');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
