import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ToastController } from '@ionic/angular';

import { TranslateService } from '@ngx-translate/core';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IonicUiService } from './ionic-ui.service';

describe('IonicUiService', () => {
  const presentMock = vi.fn();

  const toastControllerMock = {
    create: vi.fn(),
  };

  const translateServiceMock = {
    instant: vi.fn(),
  };

  let service: IonicUiService;

  beforeEach(() => {
    vi.clearAllMocks();

    toastControllerMock.create.mockResolvedValue({
      present: presentMock,
    });

    TestBed.configureTestingModule({
      providers: [
        IonicUiService,
        {
          provide: ToastController,
          useValue: toastControllerMock,
        },
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
      ],
    });

    service = TestBed.inject(IonicUiService);
  });

  describe('showError', () => {
    it('should translate the message key', async () => {
      translateServiceMock.instant.mockReturnValue('Something went wrong');

      await service.showError('errors.generic');

      expect(translateServiceMock.instant).toHaveBeenCalledWith('errors.generic');
    });

    it('should create an error toast', async () => {
      translateServiceMock.instant.mockReturnValue('Something went wrong');

      await service.showError('errors.generic');

      expect(toastControllerMock.create).toHaveBeenCalledWith({
        message: 'Something went wrong',
        duration: 2500,
        color: 'warning',
        position: 'bottom',
      });
    });

    it('should present the toast', async () => {
      translateServiceMock.instant.mockReturnValue('Something went wrong');

      await service.showError('errors.generic');

      expect(presentMock).toHaveBeenCalledOnce();
    });
  });

  describe('closeSlidingItems', () => {
    it('should close all sliding items', async () => {
      const firstClose = vi.fn().mockResolvedValue(undefined);
      const secondClose = vi.fn().mockResolvedValue(undefined);

      const hostElement = document.createElement('div');

      vi.spyOn(hostElement, 'querySelectorAll').mockReturnValue([
        { close: firstClose },
        { close: secondClose },
      ] as unknown as NodeListOf<Element>);

      const host = new ElementRef(hostElement);

      await service.closeSlidingItems(host);

      expect(firstClose).toHaveBeenCalledOnce();
      expect(secondClose).toHaveBeenCalledOnce();
    });

    it('should handle hosts without sliding items', async () => {
      const hostElement = document.createElement('div');
      const host = new ElementRef(hostElement);

      await service.closeSlidingItems(host);

      expect(hostElement.querySelectorAll('ion-item-sliding')).toHaveLength(0);
    });
  });
});
