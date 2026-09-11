import { HttpErrorResponse, HttpResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

import { ServerStartupService } from '../services';

const SERVER_STARTUP_THRESHOLD = 5_000;

const SERVER_UNREACHABLE_STATUS_CODES = new Set([
  0, // Network error / connection refused
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]);

let nextRequestId = 0;

export const serverStartupInterceptor: HttpInterceptorFn = (req, next) => {
  const serverStartupService = inject(ServerStartupService);

  if (!req.url.startsWith(environment.api)) {
    return next(req);
  }

  const requestId = `server-request-${++nextRequestId}`;

  serverStartupService.registerRequest(requestId);

  const slowRequestTimeout = setTimeout(() => {
    serverStartupService.markAsSlow(requestId);
  }, SERVER_STARTUP_THRESHOLD);

  let completed = false;

  return next(req).pipe(
    tap({
      next: (event) => {
        if (!(event instanceof HttpResponse)) {
          return;
        }

        completed = true;
        serverStartupService.markAsSuccessful(requestId);
      },

      error: (error: unknown) => {
        completed = true;

        const connectionFailure =
          error instanceof HttpErrorResponse && SERVER_UNREACHABLE_STATUS_CODES.has(error.status);

        serverStartupService.markAsFailed(requestId, connectionFailure);
      },
    }),

    finalize(() => {
      clearTimeout(slowRequestTimeout);

      if (!completed) {
        serverStartupService.unregisterRequest(requestId);
      }
    }),
  );
};
