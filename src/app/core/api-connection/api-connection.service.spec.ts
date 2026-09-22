import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiConnectionService } from './api-connection.service';

describe('ApiConnectionService', () => {
  let service: ApiConnectionService;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [ApiConnectionService],
    });

    service = TestBed.inject(ApiConnectionService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('registerRequest', () => {
    it('should keep the connection status hidden initially', () => {
      service.registerRequest('request-1');

      expect(service.status()).toBe('hidden');
    });
  });

  describe('markAsSlow', () => {
    it('should set the status to connecting for a tracked request', () => {
      service.registerRequest('request-1');

      service.markAsSlow('request-1');

      expect(service.status()).toBe('connecting');
    });

    it('should ignore an unknown request', () => {
      service.markAsSlow('unknown');

      expect(service.status()).toBe('hidden');
    });
  });

  describe('markAsSuccessful', () => {
    it('should remain hidden when a fast request succeeds', () => {
      service.registerRequest('request-1');

      service.markAsSuccessful('request-1');

      expect(service.status()).toBe('hidden');
    });

    it('should show connected when a slow request succeeds', () => {
      service.registerRequest('request-1');
      service.markAsSlow('request-1');

      service.markAsSuccessful('request-1');

      expect(service.status()).toBe('connected');
    });

    it('should hide the connected status after 1500 ms', () => {
      service.registerRequest('request-1');
      service.markAsSlow('request-1');
      service.markAsSuccessful('request-1');

      vi.advanceTimersByTime(1_499);

      expect(service.status()).toBe('connected');

      vi.advanceTimersByTime(1);

      expect(service.status()).toBe('hidden');
    });

    it('should ignore an unknown request', () => {
      service.markAsSuccessful('unknown');

      expect(service.status()).toBe('hidden');
    });
  });

  describe('markAsFailed', () => {
    it('should treat an HTTP response error as an established connection', () => {
      service.registerRequest('request-1');
      service.markAsSlow('request-1');

      service.markAsFailed('request-1', false);

      expect(service.status()).toBe('connected');
    });

    it('should show failed when the last request ends with a connection failure', () => {
      service.registerRequest('request-1');
      service.markAsSlow('request-1');

      service.markAsFailed('request-1', true);

      expect(service.status()).toBe('failed');
    });

    it('should hide the failed status after 2500 ms', () => {
      service.registerRequest('request-1');
      service.markAsSlow('request-1');
      service.markAsFailed('request-1', true);

      vi.advanceTimersByTime(2_499);

      expect(service.status()).toBe('failed');

      vi.advanceTimersByTime(1);

      expect(service.status()).toBe('hidden');
    });

    it('should wait for remaining requests before showing failed', () => {
      service.registerRequest('request-1');
      service.registerRequest('request-2');

      service.markAsSlow('request-1');

      service.markAsFailed('request-1', true);

      expect(service.status()).toBe('connecting');

      service.markAsFailed('request-2', true);

      expect(service.status()).toBe('failed');
    });

    it('should ignore failures when the connection status is not connecting', () => {
      service.registerRequest('request-1');

      service.markAsFailed('request-1', true);

      expect(service.status()).toBe('hidden');
    });

    it('should ignore an unknown request', () => {
      service.markAsFailed('unknown', true);

      expect(service.status()).toBe('hidden');
    });
  });

  describe('unregisterRequest', () => {
    it('should hide the connecting state when the last request is unregistered', () => {
      service.registerRequest('request-1');
      service.markAsSlow('request-1');

      service.unregisterRequest('request-1');

      expect(service.status()).toBe('hidden');
    });

    it('should keep connecting while tracked requests remain', () => {
      service.registerRequest('request-1');
      service.registerRequest('request-2');

      service.markAsSlow('request-1');

      service.unregisterRequest('request-1');

      expect(service.status()).toBe('connecting');
    });

    it('should ignore an unknown request', () => {
      service.unregisterRequest('unknown');

      expect(service.status()).toBe('hidden');
    });
  });

  describe('hide timeout', () => {
    it('should cancel a pending hide timeout when a new slow request starts', () => {
      service.registerRequest('request-1');
      service.markAsSlow('request-1');
      service.markAsSuccessful('request-1');

      expect(service.status()).toBe('connected');

      service.registerRequest('request-2');
      service.markAsSlow('request-2');

      vi.advanceTimersByTime(1_500);

      expect(service.status()).toBe('connecting');
    });
  });
});
