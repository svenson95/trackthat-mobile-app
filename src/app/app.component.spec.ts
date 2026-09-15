import { provideHttpClient, withXhr } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { beforeEach, describe, expect, it } from 'vitest';

import { provideTestTranslations } from '../testing/translate-testing.provider';
import { AppService } from './core';

import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideTestTranslations(),
        provideRouter(appRoutes),
        provideHttpClient(withXhr()),
        AppService,
        { provide: SwUpdate, useValue: { versionUpdates: { subscribe: (): void => {} } } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
