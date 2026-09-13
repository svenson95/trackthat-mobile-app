import { provideHttpClient, withXhr } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { addIcons } from 'ionicons';
import { logoGoogle } from 'ionicons/icons';
import { beforeEach, describe, expect, it } from 'vitest';

import '../../../testing/mocks/google.mock';
import { provideTestTranslations } from '../../../testing/translate-testing.provider';

import { ContentContainerComponent } from '../../shared/components';

import { OverviewPage } from './overview.page';

describe('OverviewPage', () => {
  let component: OverviewPage;
  let fixture: ComponentFixture<OverviewPage>;

  beforeEach(async () => {
    addIcons({
      'logo-google': logoGoogle,
    });

    await TestBed.configureTestingModule({
      imports: [ContentContainerComponent, OverviewPage],
      providers: [provideTestTranslations(), provideHttpClient(withXhr())],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
