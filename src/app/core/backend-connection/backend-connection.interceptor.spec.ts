import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../environments/environment';

import { backendConnectionInterceptor } from './backend-connection.interceptor';
import { BackendConnectionService } from './backend-connection.service';

describe('backendConnectionInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let backendConnectionService: BackendConnectionService;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([backendConnectionInterceptor])),
        provideHttpClientTesting(),
        BackendConnectionService,
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    backendConnectionService = TestBed.inject(BackendConnectionService);
  });

  afterEach(() => {
    httpTestingController.verify();
    vi.useRealTimers();
  });

  describe('backend requests', () => {
    it('should keep the status hidden for a fast successful request', () => {
      httpClient.get(`${environment.api}/health`).subscribe();

      const request = httpTestingController.expectOne(`${environment.api}/health`);

      request.flush({});

      expect(backendConnectionService.status()).toBe('hidden');
    });

    it('should mark a request as connecting after 5000 ms', () => {
      httpClient.get(`${environment.api}/health`).subscribe();

      const request = httpTestingController.expectOne(`${environment.api}/health`);

      vi.advanceTimersByTime(5_000);

      expect(backendConnectionService.status()).toBe('connecting');

      request.flush({});
    });

    it('should show connected when a slow request succeeds', () => {
      httpClient.get(`${environment.api}/health`).subscribe();

      const request = httpTestingController.expectOne(`${environment.api}/health`);

      vi.advanceTimersByTime(5_000);

      request.flush({});

      expect(backendConnectionService.status()).toBe('connected');
    });

    it('should show failed for a network error', () => {
      httpClient.get(`${environment.api}/health`).subscribe({
        error: () => undefined,
      });

      const request = httpTestingController.expectOne(`${environment.api}/health`);

      vi.advanceTimersByTime(5_000);

      request.error(new ProgressEvent('error'));

      expect(backendConnectionService.status()).toBe('failed');
    });

    it.each([502, 503, 504])('should show failed for unreachable backend status %s', (status) => {
      httpClient.get(`${environment.api}/health`).subscribe({
        error: () => undefined,
      });

      const request = httpTestingController.expectOne(`${environment.api}/health`);

      vi.advanceTimersByTime(5_000);

      request.flush(
        {},
        {
          status,
          statusText: 'Connection error',
        },
      );

      expect(backendConnectionService.status()).toBe('failed');
    });

    it('should show connected when the backend responds with a regular HTTP error', () => {
      httpClient.get(`${environment.api}/health`).subscribe({
        error: () => undefined,
      });

      const request = httpTestingController.expectOne(`${environment.api}/health`);

      vi.advanceTimersByTime(5_000);

      request.flush(
        {},
        {
          status: 500,
          statusText: 'Internal Server Error',
        },
      );

      expect(backendConnectionService.status()).toBe('connected');
    });
  });

  describe('non-backend requests', () => {
    it('should ignore requests outside the backend API', () => {
      httpClient.get('/assets/i18n/de.json').subscribe();

      const request = httpTestingController.expectOne('/assets/i18n/de.json');

      vi.advanceTimersByTime(5_000);

      expect(backendConnectionService.status()).toBe('hidden');

      request.flush({});
    });
  });
});
