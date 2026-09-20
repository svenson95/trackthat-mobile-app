import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { AnimationController } from '@ionic/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BackendConnectionToastComponent } from './backend-connection-toast.component';
import { BackendConnectionService } from './backend-connection.service';

describe('BackendConnectionToastComponent', () => {
  let fixture: ComponentFixture<BackendConnectionToastComponent>;
  let backendConnectionService: BackendConnectionService;

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
      imports: [BackendConnectionToastComponent],
      providers: [
        BackendConnectionService,
        {
          provide: AnimationController,
          useValue: animationControllerMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BackendConnectionToastComponent);
    backendConnectionService = TestBed.inject(BackendConnectionService);

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
      backendConnectionService.status.set('connecting');

      fixture.detectChanges();

      const toast = getToast();

      expect(toast.isOpen).toBe(true);
      expect(toast.classList.contains('backend-connection-toast--connecting')).toBe(true);
    });

    it('should show the connected status', () => {
      backendConnectionService.status.set('connected');

      fixture.detectChanges();

      const toast = getToast();

      expect(toast.isOpen).toBe(true);
      expect(toast.classList.contains('backend-connection-toast--connected')).toBe(true);
    });

    it('should show the failed status', () => {
      backendConnectionService.status.set('failed');

      fixture.detectChanges();

      const toast = getToast();

      expect(toast.isOpen).toBe(true);
      expect(toast.classList.contains('backend-connection-toast--failed')).toBe(true);
    });
  });

  describe('countdown', () => {
    it('should decrease the remaining connection time every second', () => {
      backendConnectionService.status.set('connecting');
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
      backendConnectionService.status.set('connecting');
      fixture.detectChanges();

      vi.advanceTimersByTime(20_000);
      fixture.detectChanges();

      const toast = getToast();

      expect(toast.message).toBeTruthy();
      expect(getRemainingSeconds(toast.message)).toBeNull();
    });

    it('should reset the countdown when connecting starts again', () => {
      backendConnectionService.status.set('connecting');
      fixture.detectChanges();

      vi.advanceTimersByTime(5000);
      fixture.detectChanges();

      expect(getRemainingSeconds(getToast().message)).toBe(15);

      backendConnectionService.status.set('failed');
      fixture.detectChanges();

      backendConnectionService.status.set('connecting');
      fixture.detectChanges();

      expect(getRemainingSeconds(getToast().message)).toBe(20);
    });
  });

  describe('success hold duration', () => {
    it('should keep the connected status visible for 700 ms after the service becomes hidden', () => {
      backendConnectionService.status.set('connected');
      fixture.detectChanges();

      backendConnectionService.status.set('hidden');
      fixture.detectChanges();

      vi.advanceTimersByTime(699);
      fixture.detectChanges();

      expect(getToast().isOpen).toBe(true);

      vi.advanceTimersByTime(1);
      fixture.detectChanges();

      expect(getToast().isOpen).toBe(false);
    });

    it('should hide immediately after a failed status becomes hidden', () => {
      backendConnectionService.status.set('failed');
      fixture.detectChanges();

      backendConnectionService.status.set('hidden');
      fixture.detectChanges();

      expect(getToast().isOpen).toBe(false);
    });
  });
});
