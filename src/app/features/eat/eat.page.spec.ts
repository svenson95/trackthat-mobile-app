import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { provideTestTranslations } from '../../../testing/translate-testing.provider';

import { ContentContainerComponent } from '../../shared';

import { EatPage } from './eat.page';

describe('EatPage', () => {
  let component: EatPage;
  let fixture: ComponentFixture<EatPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EatPage, ContentContainerComponent],
      providers: [provideTestTranslations()],
    }).compileComponents();

    fixture = TestBed.createComponent(EatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
