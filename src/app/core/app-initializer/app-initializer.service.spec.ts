import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppInitializerService } from './app-initializer.service';

describe('AppInitializerService', () => {
  let service: AppInitializerService;

  const INITIALIZER_ID = 'app-init-overlay';

  const createInitializer = (): HTMLElement => {
    const initializer = document.createElement('div');
    initializer.id = INITIALIZER_ID;

    document.body.appendChild(initializer);

    return initializer;
  };

  const runAnimationFrames = (): void => {
    vi.advanceTimersByTime(16);
    vi.advanceTimersByTime(16);
  };

  beforeEach(() => {
    vi.useFakeTimers();

    vi.spyOn(performance, 'now').mockReturnValue(0);

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback): number =>
      window.setTimeout(() => callback(performance.now()), 16),
    );

    TestBed.configureTestingModule({
      providers: [AppInitializerService],
    });

    service = TestBed.inject(AppInitializerService);
    service.init();
  });

  afterEach(() => {
    document.getElementById(INITIALIZER_ID)?.remove();

    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe('init', () => {
    it('should use the initialization time as start of the minimum visible duration', () => {
      vi.spyOn(performance, 'now').mockReturnValue(200);
      service.init();

      const initializer = createInitializer();

      vi.spyOn(performance, 'now').mockReturnValue(300);

      service.hideOverlay();

      vi.advanceTimersByTime(499);

      expect(initializer.classList.contains('app-init-overlay--hidden')).toBe(false);

      vi.advanceTimersByTime(1);
      runAnimationFrames();

      expect(initializer.classList.contains('app-init-overlay--hidden')).toBe(true);
    });
  });

  describe('hideOverlay', () => {
    it('should keep the initializer visible for at least 600 ms', () => {
      const initializer = createInitializer();

      vi.spyOn(performance, 'now').mockReturnValue(100);

      service.hideOverlay();

      vi.advanceTimersByTime(499);

      expect(initializer.classList.contains('app-init-overlay--hidden')).toBe(false);

      vi.advanceTimersByTime(1);
      runAnimationFrames();

      expect(initializer.classList.contains('app-init-overlay--hidden')).toBe(true);
    });

    it('should start hiding immediately when the minimum visible duration has already elapsed', () => {
      const initializer = createInitializer();

      vi.spyOn(performance, 'now').mockReturnValue(700);

      service.hideOverlay();

      vi.advanceTimersByTime(0);
      runAnimationFrames();

      expect(initializer.classList.contains('app-init-overlay--hidden')).toBe(true);
    });

    it('should wait for two animation frames before hiding the initializer', () => {
      const initializer = createInitializer();

      vi.spyOn(performance, 'now').mockReturnValue(600);

      service.hideOverlay();

      vi.advanceTimersByTime(0);
      vi.advanceTimersByTime(16);

      expect(initializer.classList.contains('app-init-overlay--hidden')).toBe(false);

      vi.advanceTimersByTime(16);

      expect(initializer.classList.contains('app-init-overlay--hidden')).toBe(true);
    });

    it('should remove the initializer after the fade duration', () => {
      const initializer = createInitializer();

      vi.spyOn(performance, 'now').mockReturnValue(600);

      service.hideOverlay();

      vi.advanceTimersByTime(0);
      runAnimationFrames();

      expect(document.body.contains(initializer)).toBe(true);

      vi.advanceTimersByTime(299);

      expect(document.body.contains(initializer)).toBe(true);

      vi.advanceTimersByTime(1);

      expect(document.body.contains(initializer)).toBe(false);
    });

    it('should do nothing when the initializer element does not exist', () => {
      vi.spyOn(performance, 'now').mockReturnValue(600);

      expect(() => {
        service.hideOverlay();

        vi.advanceTimersByTime(0);
        runAnimationFrames();
      }).not.toThrow();
    });
  });
});
