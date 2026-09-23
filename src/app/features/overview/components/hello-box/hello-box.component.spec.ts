import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { provideTestTranslations } from '../../../../../testing/translate-testing.provider';

import { HelloBoxComponent } from './hello-box.component';

describe('HelloBoxComponent', () => {
  let fixture: ComponentFixture<HelloBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelloBoxComponent],
      providers: [provideRouter([]), provideTestTranslations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HelloBoxComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
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
