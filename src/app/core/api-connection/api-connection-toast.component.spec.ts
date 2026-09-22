import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { AnimationController } from '@ionic/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiConnectionToastComponent } from './api-connection-toast.component';
import { ApiConnectionService } from './api-connection.service';

describe('ApiConnectionToastComponent', () => {
  let fixture: ComponentFixture<ApiConnectionToastComponent>;
  let apiConnectionService: ApiConnectionService;

  const animationMock = {
    addElement: vi.fn().mockReturnThis(),
    duration: vi.fn().mockReturnThis(),
    easing: vi.fn().mockReturnThis(),
    fromTo: vi.fn().mockReturnThis(),
    play: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn(),
  };

  const animationControllerMock = {
    create: vi.fn().mockReturnValue(animationMock),
  };

  const getToast = (): HTMLIonToastElement => fixture.nativeElement.querySelector('ion-toast');

  const getRemainingSeconds = (message: HTMLIonToastElement['message']): number | null => {
    if (typeof message !== 'string') {
      return null;
    }

    const match = message.match(/\d+/);

    return match ? Number(match[0]) : null;
  };

  beforeEach(async () => {
    vi.useFakeTimers();

    animationMock.addElement.mockReturnValue(animationMock);
    animationMock.duration.mockReturnValue(animationMock);
    animationMock.easing.mockReturnValue(animationMock);
    animationMock.fromTo.mockReturnValue(animationMock);

    animationControllerMock.create.mockReturnValue(animationMock);

    await TestBed.configureTestingModule({
      imports: [ApiConnectionToastComponent],
      providers: [
        ApiConnectionService,
        {
          provide: AnimationController,
          useValue: animationControllerMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApiConnectionToastComponent);
    apiConnectionService = TestBed.inject(ApiConnectionService);

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('status display', () => {
    it('should be hidden initially', () => {
      expect(getToast().isOpen).toBe(false);
    });

    it('should show the connecting status', () => {
      apiConnectionService.status.set('connecting');

      fixture.detectChanges();

      const toast = getToast();

      expect(toast.isOpen).toBe(true);
      expect(toast.classList.contains('api-connection-toast--connecting')).toBe(true);
    });

    it('should show the connected status', () => {
      apiConnectionService.status.set('connected');

      fixture.detectChanges();

      const toast = getToast();

      expect(toast.isOpen).toBe(true);
      expect(toast.classList.contains('api-connection-toast--connected')).toBe(true);
    });

    it('should show the failed status', () => {
      apiConnectionService.status.set('failed');

      fixture.detectChanges();

      const toast = getToast();

      expect(toast.isOpen).toBe(true);
      expect(toast.classList.contains('api-connection-toast--failed')).toBe(true);
    });
  });

  describe('countdown', () => {
    it('should decrease the remaining connection time every second', () => {
      apiConnectionService.status.set('connecting');
      fixture.detectChanges();

      expect(getRemainingSeconds(getToast().message)).toBe(20);

      vi.advanceTimersByTime(1000);
      fixture.detectChanges();

      expect(getRemainingSeconds(getToast().message)).toBe(19);

      vi.advanceTimersByTime(18_000);
      fixture.detectChanges();

      expect(getRemainingSeconds(getToast().message)).toBe(1);
    });

    it('should replace the countdown when the expected connection time is exceeded', () => {
      apiConnectionService.status.set('connecting');
      fixture.detectChanges();

      vi.advanceTimersByTime(20_000);
      fixture.detectChanges();

      const toast = getToast();

      expect(toast.message).toBeTruthy();
      expect(getRemainingSeconds(toast.message)).toBeNull();
    });

    it('should reset the countdown when connecting starts again', () => {
      apiConnectionService.status.set('connecting');
      fixture.detectChanges();

      vi.advanceTimersByTime(5000);
      fixture.detectChanges();

      expect(getRemainingSeconds(getToast().message)).toBe(15);

      apiConnectionService.status.set('failed');
      fixture.detectChanges();

      apiConnectionService.status.set('connecting');
      fixture.detectChanges();

      expect(getRemainingSeconds(getToast().message)).toBe(20);
    });
  });

  describe('success state', () => {
    it('should keep the subheader while transitioning to the connected state', () => {
      apiConnectionService.status.set('connecting');
      fixture.detectChanges();

      const message = getToast().message;

      apiConnectionService.status.set('connected');
      fixture.detectChanges();

      const toast = getToast();

      expect(toast.message).toBe(message);
      expect(toast.classList.contains('api-connection-toast--connected')).toBe(true);
    });

    it('should keep the connected status visible for 1200 ms after the service becomes hidden', () => {
      apiConnectionService.status.set('connected');
      fixture.detectChanges();

      apiConnectionService.status.set('hidden');
      fixture.detectChanges();

      vi.advanceTimersByTime(1199);
      fixture.detectChanges();

      expect(getToast().isOpen).toBe(true);

      vi.advanceTimersByTime(1);
      fixture.detectChanges();

      expect(getToast().isOpen).toBe(false);
    });

    it('should hide immediately after a failed status becomes hidden', () => {
      apiConnectionService.status.set('failed');
      fixture.detectChanges();

      apiConnectionService.status.set('hidden');
      fixture.detectChanges();

      expect(getToast().isOpen).toBe(false);
    });
  });
});
