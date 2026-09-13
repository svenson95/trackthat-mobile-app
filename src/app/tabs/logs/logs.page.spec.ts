import { signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { provideTestTranslations } from '../../../testing/translate-testing.provider';

import { UserService } from '../../shared/services';

import { LogsWorkoutService } from './services';

import { LogsPage } from './logs.page';

describe('LogsPage', () => {
  let component: LogsPage;
  let fixture: ComponentFixture<LogsPage>;

  const logsWorkoutServiceMock = {
    allLogsWorkoutResource: {
      value: signal([]),
      isLoading: signal(false),
    },
  };

  const userServiceMock = {
    currentLanguage: signal('de'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogsPage],
      providers: [
        provideTestTranslations(),
        {
          provide: LogsWorkoutService,
          useValue: logsWorkoutServiceMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LogsPage);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
