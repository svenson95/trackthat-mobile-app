import { TestBed } from '@angular/core/testing';
import { SwUpdate, type VersionEvent } from '@angular/service-worker';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppUpdateService } from './app-update.service';

describe('AppUpdateService', () => {
  let service: AppUpdateService;
  let versionUpdates$: Subject<VersionEvent>;

  const alertMock = {
    present: vi.fn(),
  };

  const alertControllerMock = {
    create: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    versionUpdates$ = new Subject<VersionEvent>();

    alertMock.present.mockResolvedValue(undefined);
    alertControllerMock.create.mockResolvedValue(alertMock);

    TestBed.configureTestingModule({
      providers: [
        AppUpdateService,
        {
          provide: SwUpdate,
          useValue: {
            versionUpdates: versionUpdates$.asObservable(),
          },
        },
        {
          provide: AlertController,
          useValue: alertControllerMock,
        },
      ],
    });

    service = TestBed.inject(AppUpdateService);
  });

  describe('watchForUpdates', () => {
    it('should show an alert when a new version is ready', async () => {
      service.watchForUpdates();

      versionUpdates$.next({
        type: 'VERSION_READY',
        currentVersion: {
          hash: 'current',
          appData: undefined,
        },
        latestVersion: {
          hash: 'latest',
          appData: undefined,
        },
      });

      await vi.waitFor(() => {
        expect(alertControllerMock.create).toHaveBeenCalledOnce();
      });

      expect(alertControllerMock.create).toHaveBeenCalledWith({
        header: 'Update verfügbar',
        message: 'Eine neue Version der App ist verfügbar',
        buttons: [
          {
            text: 'Später',
            role: 'cancel',
          },
          {
            text: 'Neu laden',
            handler: expect.any(Function),
          },
        ],
      });

      expect(alertMock.present).toHaveBeenCalledOnce();
    });

    it('should ignore version events when no new version is available', () => {
      service.watchForUpdates();

      versionUpdates$.next({
        type: 'NO_NEW_VERSION_DETECTED',
        version: {
          hash: 'current',
          appData: undefined,
        },
      });

      expect(alertControllerMock.create).not.toHaveBeenCalled();
      expect(alertMock.present).not.toHaveBeenCalled();
    });
  });
});
