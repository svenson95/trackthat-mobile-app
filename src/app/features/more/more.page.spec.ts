import { provideHttpClient, withXhr } from '@angular/common/http';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { provideTestTranslations } from '../../../testing/translate-testing.provider';

import { MorePage } from './more.page';

describe('MorePage', () => {
  let component: MorePage;
  let fixture: ComponentFixture<MorePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MorePage],
      providers: [provideTestTranslations(), provideHttpClient(withXhr())],
    }).compileComponents();

    fixture = TestBed.createComponent(MorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
