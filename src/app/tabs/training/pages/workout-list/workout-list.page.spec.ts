import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ContentContainerComponent } from '../../../../components';
import { USER_MOCK } from '../../../../test-mocks/user.mock';

import { WorkoutListPage } from './workout-list.page';

describe('WorkoutListPage', () => {
  let component: WorkoutListPage;
  let fixture: ComponentFixture<WorkoutListPage>;

  beforeEach(async () => {
    localStorage.setItem('user', JSON.stringify(USER_MOCK));

    await TestBed.configureTestingModule({
      imports: [ContentContainerComponent, WorkoutListPage],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutListPage);
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
