import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AppInitializerService,
  AppUpdateService,
  AuthSessionService,
  LanguageService,
} from './core';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  const appInitializerServiceMock = {
    hideOverlay: vi.fn(),
  };

  const appUpdateServiceMock = {
    watchForUpdates: vi.fn(),
  };

  const authSessionServiceMock = {
    verifySession: vi.fn(),
  };

  const languageServiceMock = {
    initialize: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: AppInitializerService, useValue: appInitializerServiceMock },
        { provide: AppUpdateService, useValue: appUpdateServiceMock },
        { provide: AuthSessionService, useValue: authSessionServiceMock },
        { provide: LanguageService, useValue: languageServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  describe('creation', () => {
    it('should create the app', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('initial route activation', () => {
    it('should hide the app initializer only once', () => {
      component.onInitialRouteActivated();
      component.onInitialRouteActivated();

      expect(appInitializerServiceMock.hideOverlay).toHaveBeenCalledOnce();
    });
  });
});
