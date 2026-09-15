import { signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, chevronDown, ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { provideTestTranslations } from '../../../../../testing/translate-testing.provider';
import { UserService } from '../../../../core';
import { HelperService } from '../../../../shared';

import { IsEditingService, WorkoutsService } from '../../services';

import { WorkoutsPage } from './workouts.page';

describe('WorkoutsPage', () => {
  let component: WorkoutsPage;
  let fixture: ComponentFixture<WorkoutsPage>;

  const helperServiceMock = {
    closeSlidingItems: vi.fn().mockResolvedValue(undefined),
    showError: vi.fn().mockResolvedValue(undefined),
  };

  const userServiceMock = {
    userData: signal({
      id: 'test-user',
    }),
  };

  const workoutsServiceMock = {
    workoutsResource: {
      reload: vi.fn(() => true),
      isLoading: signal(false),
      status: signal('resolved'),
    },
    sortedWorkouts: signal([]),
    updateAllWorkouts: vi.fn(() => of(undefined)),
  };

  const isEditingServiceMock = {
    isEditing: signal(false),
    editedWorkouts: signal([]),
    setIsEditing: vi.fn(),
    setEditedWorkouts: vi.fn(),
  };

  beforeEach(async () => {
    addIcons({
      'ellipsis-vertical': ellipsisVertical,
      'ellipsis-horizontal': ellipsisHorizontal,
      'chevron-down': chevronDown,
      add,
    });

    await TestBed.configureTestingModule({
      imports: [WorkoutsPage],
      providers: [
        provideIonicAngular(),
        provideTestTranslations(),
        {
          provide: HelperService,
          useValue: helperServiceMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: WorkoutsService,
          useValue: workoutsServiceMock,
        },
        {
          provide: IsEditingService,
          useValue: isEditingServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutsPage);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
