import { HttpErrorResponse, HttpResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

import { BackendConnectionService } from './backend-connection.service';

const BACKEND_CONNECTION_THRESHOLD_MS = 5_000;

const SERVER_UNREACHABLE_STATUS_CODES = new Set([
  0, // Network error / connection refused
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]);

let nextRequestId = 0;

export const backendConnectionInterceptor: HttpInterceptorFn = (req, next) => {
  const backendConnectionService = inject(BackendConnectionService);

  if (!req.url.startsWith(environment.api)) {
    return next(req);
  }

  const requestId = `server-request-${++nextRequestId}`;

  backendConnectionService.registerRequest(requestId);

  const slowRequestTimeout = setTimeout(() => {
    backendConnectionService.markAsSlow(requestId);
  }, BACKEND_CONNECTION_THRESHOLD_MS);

  let completed = false;

  return next(req).pipe(
    tap({
      next: (event) => {
        if (!(event instanceof HttpResponse)) {
          return;
        }

        completed = true;
        backendConnectionService.markAsSuccessful(requestId);
      },

      error: (error: unknown) => {
        completed = true;

        const connectionFailure =
          error instanceof HttpErrorResponse && SERVER_UNREACHABLE_STATUS_CODES.has(error.status);

        backendConnectionService.markAsFailed(requestId, connectionFailure);
      },
    }),

    finalize(() => {
      clearTimeout(slowRequestTimeout);

      if (!completed) {
        backendConnectionService.unregisterRequest(requestId);
      }
    }),
  );
};
