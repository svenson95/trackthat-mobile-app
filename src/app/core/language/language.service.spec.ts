import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TranslateService } from '@ngx-translate/core';

import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  const translateServiceMock = {
    addLangs: vi.fn(),
    getBrowserLang: vi.fn(),
    use: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    document.documentElement.lang = '';

    translateServiceMock.getBrowserLang.mockReturnValue('de');

    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
      ],
    });

    service = TestBed.inject(LanguageService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  describe('initialize', () => {
    it('should register supported languages', () => {
      service.initialize();

      expect(translateServiceMock.addLangs).toHaveBeenCalledWith(['de', 'en']);
    });

    it('should prefer the stored language', () => {
      localStorage.setItem('language', 'en');
      translateServiceMock.getBrowserLang.mockReturnValue('de');

      service.initialize();

      expect(translateServiceMock.use).toHaveBeenCalledWith('en');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should use the browser language when no stored language exists', () => {
      translateServiceMock.getBrowserLang.mockReturnValue('en');

      service.initialize();

      expect(translateServiceMock.use).toHaveBeenCalledWith('en');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should ignore an unsupported stored language', () => {
      localStorage.setItem('language', 'fr');
      translateServiceMock.getBrowserLang.mockReturnValue('en');

      service.initialize();

      expect(translateServiceMock.use).toHaveBeenCalledWith('en');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should fall back to German when no supported language is available', () => {
      localStorage.setItem('language', 'fr');
      translateServiceMock.getBrowserLang.mockReturnValue('es');

      service.initialize();

      expect(translateServiceMock.use).toHaveBeenCalledWith('de');
      expect(document.documentElement.lang).toBe('de');
    });

    it('should fall back to German when no stored or browser language exists', () => {
      translateServiceMock.getBrowserLang.mockReturnValue(undefined);

      service.initialize();

      expect(translateServiceMock.use).toHaveBeenCalledWith('de');
      expect(document.documentElement.lang).toBe('de');
    });
  });
});
