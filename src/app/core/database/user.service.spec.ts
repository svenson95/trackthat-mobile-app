import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TranslateService } from '@ngx-translate/core';

import type { UserDoc } from './types/users.types';
import { UserService } from './user.service';

describe('UserService', () => {
  const translateServiceMock = {
    use: vi.fn(),
  };

  const user = {
    id: '1',
    googleId: 'google-id',
    name: 'Test User',
    picture: 'https://example.com/avatar.jpg',
    email: 'test@example.com',
  } satisfies UserDoc;

  beforeEach(() => {
    localStorage.clear();

    translateServiceMock.use.mockReset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
      ],
    });
  });

  describe('currentLanguage', () => {
    it('should use German as the default language', () => {
      const service = TestBed.inject(UserService);

      expect(service.currentLanguage()).toBe('de');
    });

    it('should initialize the language from local storage', () => {
      localStorage.setItem('language', 'en');

      const service = TestBed.inject(UserService);

      expect(service.currentLanguage()).toBe('en');
    });
  });

  describe('userData', () => {
    it('should be undefined when no user is stored', () => {
      const service = TestBed.inject(UserService);

      expect(service.userData()).toBeUndefined();
    });

    it('should initialize the user from local storage', () => {
      localStorage.setItem('user', JSON.stringify(user));

      const service = TestBed.inject(UserService);

      expect(service.userData()).toEqual(user);
    });
  });

  describe('setUser', () => {
    it('should store the user and update user data', () => {
      const service = TestBed.inject(UserService);

      service.setUser(user);

      expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
      expect(service.userData()).toEqual(user);
    });
  });

  describe('clearUser', () => {
    it('should remove the stored user and clear user data', () => {
      localStorage.setItem('user', JSON.stringify(user));

      const service = TestBed.inject(UserService);

      service.clearUser();

      expect(localStorage.getItem('user')).toBeNull();
      expect(service.userData()).toBeUndefined();
    });
  });

  describe('setLanguage', () => {
    it('should store and activate the selected language', () => {
      const service = TestBed.inject(UserService);

      service.setLanguage('en');

      expect(localStorage.getItem('language')).toBe('en');
      expect(translateServiceMock.use).toHaveBeenCalledOnce();
      expect(translateServiceMock.use).toHaveBeenCalledWith('en');
      expect(service.currentLanguage()).toBe('en');
    });
  });
});
