import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TranslateService } from '@ngx-translate/core';

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './language.config';
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
      service.init();

      expect(translateServiceMock.addLangs).toHaveBeenCalledWith([...SUPPORTED_LANGUAGES]);
    });

    it('should prefer the stored language', () => {
      localStorage.setItem('language', 'en');
      translateServiceMock.getBrowserLang.mockReturnValue('de');

      service.init();

      expect(translateServiceMock.use).toHaveBeenCalledWith('en');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should use the browser language when no stored language exists', () => {
      translateServiceMock.getBrowserLang.mockReturnValue('en');

      service.init();

      expect(translateServiceMock.use).toHaveBeenCalledWith('en');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should ignore an unsupported stored language', () => {
      localStorage.setItem('language', 'fr');
      translateServiceMock.getBrowserLang.mockReturnValue('en');

      service.init();

      expect(translateServiceMock.use).toHaveBeenCalledWith('en');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should fall back to the default language when no supported language is available', () => {
      localStorage.setItem('language', 'fr');
      translateServiceMock.getBrowserLang.mockReturnValue('es');

      service.init();

      expect(translateServiceMock.use).toHaveBeenCalledWith(DEFAULT_LANGUAGE);
      expect(document.documentElement.lang).toBe(DEFAULT_LANGUAGE);
    });

    it('should fall back to the default language when no stored or browser language exists', () => {
      translateServiceMock.getBrowserLang.mockReturnValue(undefined);

      service.init();

      expect(translateServiceMock.use).toHaveBeenCalledWith(DEFAULT_LANGUAGE);
      expect(document.documentElement.lang).toBe(DEFAULT_LANGUAGE);
    });
  });
});
