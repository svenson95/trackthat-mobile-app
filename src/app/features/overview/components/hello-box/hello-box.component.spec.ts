import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { provideTestTranslations } from '../../../../../testing/translate-testing.provider';
import type { UserDoc } from '../../../../core';

import { HelloBoxComponent } from './hello-box.component';

describe('HelloBoxComponent', () => {
  let fixture: ComponentFixture<HelloBoxComponent>;

  const user = {
    name: 'Sven',
  } as UserDoc;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelloBoxComponent],
      providers: [provideRouter([]), provideTestTranslations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HelloBoxComponent);

    fixture.componentRef.setInput('user', user);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the user name', () => {
    const userName: HTMLElement | null = fixture.nativeElement.querySelector('.user-name');

    expect(userName?.textContent?.trim()).toBe('Sven');
  });

  it('should display the next workout', () => {
    const workoutName: HTMLElement | null = fixture.nativeElement.querySelector('.workout-name');

    expect(workoutName?.textContent?.trim()).toBe('Brust Trizeps');
  });

  it('should display the weight chart', () => {
    const chart: SVGElement | null = fixture.nativeElement.querySelector('.weight-chart');

    expect(chart).not.toBeNull();
  });
});
