import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { AnimationController } from '@ionic/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BackendConnectionToastComponent } from './backend-connection-toast.component';
import { BackendConnectionService } from './backend-connection.service';

describe('BackendConnectionToastComponent', () => {
  let component: BackendConnectionToastComponent;
  let fixture: ComponentFixture<BackendConnectionToastComponent>;
  let backendConnectionService: BackendConnectionService;

  const animationMock = {
    addElement: vi.fn(),
    duration: vi.fn(),
    easing: vi.fn(),
    fromTo: vi.fn(),
  };

  const animationControllerMock = {
    create: vi.fn(),
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
    component = fixture.componentInstance;

    backendConnectionService = TestBed.inject(BackendConnectionService);

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('status display', () => {
    it('should be hidden initially', () => {
      const toast = fixture.nativeElement.querySelector('ion-toast');

      expect(toast.isOpen).toBe(false);
      expect(toast.message).toBe('');
    });

    it('should show the connecting message', () => {
      backendConnectionService.status.set('connecting');

      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('ion-toast');

      expect(toast.isOpen).toBe(true);
      expect(toast.message).toBe('Verbindung zur Datenbank wird hergestellt');
    });

    it('should show the connected message', () => {
      backendConnectionService.status.set('connected');

      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('ion-toast');

      expect(toast.isOpen).toBe(true);
      expect(toast.message).toBe('Verbindung hergestellt');
    });

    it('should show the failed message', () => {
      backendConnectionService.status.set('failed');

      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('ion-toast');

      expect(toast.isOpen).toBe(true);
      expect(toast.message).toBe('Verbindung zur Datenbank konnte nicht hergestellt werden');
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

      let toast = fixture.nativeElement.querySelector('ion-toast');

      expect(toast.isOpen).toBe(true);

      vi.advanceTimersByTime(1);
      fixture.detectChanges();

      toast = fixture.nativeElement.querySelector('ion-toast');

      expect(toast.isOpen).toBe(false);
    });

    it('should hide immediately after a failed status becomes hidden', () => {
      backendConnectionService.status.set('failed');
      fixture.detectChanges();

      backendConnectionService.status.set('hidden');
      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector('ion-toast');

      expect(toast.isOpen).toBe(false);
    });
  });
});
