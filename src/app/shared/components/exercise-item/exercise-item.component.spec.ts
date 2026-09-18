import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ExerciseItemComponent } from './exercise-item.component';

describe('ExerciseItemComponent', () => {
  let mediaQueryMatches = false;
  let changeListener: ((event: MediaQueryListEvent) => void) | undefined;

  const addEventListenerMock = vi.fn(
    (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      changeListener = listener;
    },
  );

  const removeEventListenerMock = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    mediaQueryMatches = false;
    changeListener = undefined;

    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: mediaQueryMatches,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    await TestBed.configureTestingModule({
      imports: [ExerciseItemComponent],
      providers: [provideTranslateService()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ExerciseItemComponent);

    fixture.componentRef.setInput('exercise', 'bench-press');
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('image path', () => {
    it('should use the default exercise image in light mode', () => {
      const fixture = TestBed.createComponent(ExerciseItemComponent);

      fixture.componentRef.setInput('exercise', 'bench-press');
      fixture.detectChanges();

      const image = fixture.nativeElement.querySelector('.exercise-image') as HTMLImageElement;

      expect(image.getAttribute('src')).toBe('assets/images/exercises/bench-press.png');
    });

    it('should update the image path when dark mode is enabled', () => {
      const fixture = TestBed.createComponent(ExerciseItemComponent);

      fixture.componentRef.setInput('exercise', 'bench-press');
      fixture.detectChanges();

      changeListener?.({
        matches: true,
      } as MediaQueryListEvent);

      fixture.detectChanges();

      const image = fixture.nativeElement.querySelector('.exercise-image') as HTMLImageElement;

      expect(image.getAttribute('src')).toBe('assets/images/exercises-white/bench-press.png');
    });

    it('should switch back to the default image when dark mode is disabled', () => {
      const fixture = TestBed.createComponent(ExerciseItemComponent);

      fixture.componentRef.setInput('exercise', 'bench-press');
      fixture.detectChanges();

      changeListener?.({
        matches: true,
      } as MediaQueryListEvent);

      changeListener?.({
        matches: false,
      } as MediaQueryListEvent);

      fixture.detectChanges();

      expect(fixture.componentInstance.darkPath()).toBe('');
    });
  });

  describe('media query listener', () => {
    it('should register the dark mode listener on init', () => {
      const fixture = TestBed.createComponent(ExerciseItemComponent);

      fixture.componentRef.setInput('exercise', 'bench-press');
      fixture.detectChanges();

      expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should remove the dark mode listener on destroy', () => {
      const fixture = TestBed.createComponent(ExerciseItemComponent);

      fixture.componentRef.setInput('exercise', 'bench-press');
      fixture.detectChanges();

      fixture.destroy();

      expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });
});
