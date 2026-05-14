import { provideHttpClient } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  add,
  bicycle,
  bicycleOutline,
  calendar,
  calendarOutline,
  ellipsisHorizontal,
  person,
  personOutline,
  restaurant,
  restaurantOutline,
} from 'ionicons/icons';

import { appRoutes } from '../app.routes';

import { TabsPage } from './tabs.page';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;
  let router: Router;

  beforeEach(async () => {
    addIcons({
      'ellipsis-horizontal': ellipsisHorizontal,
      add,
      bicycle,
      'bicycle-outline': bicycleOutline,
      restaurant,
      'restaurant-outline': restaurantOutline,
      person,
      'person-outline': personOutline,
      calendar,
      'calendar-outline': calendarOutline,
    });

    await TestBed.configureTestingModule({
      imports: [TabsPage],
      providers: [provideRouter(appRoutes), provideHttpClient()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    router.initialNavigation();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
