import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable, Subscription } from 'rxjs';
import { catchError, EMPTY, finalize, interval, startWith, switchMap } from 'rxjs';

import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly HEALTH_REFRESH_INTERVAL = 10_000;

  private pollingSub?: Subscription;
  private stopTimeout?: ReturnType<typeof setTimeout>;

  private lastPingAt = 0;
  private pingInProgress = false;

  pingApi = (): Observable<void> => this.http.get<void>(environment.api + 'health');

  pingApiIfNeeded(): Observable<void> {
    return this.pingIfAllowed();
  }

  startPolling(): void {
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = undefined;
    }

    if (this.pollingSub) return;

    this.pollingSub = interval(this.HEALTH_REFRESH_INTERVAL)
      .pipe(
        startWith(0),
        switchMap(() => this.pingIfAllowed()),
      )
      .subscribe();
  }

  stopPolling(): void {
    this.stopTimeout = setTimeout(() => {
      this.pollingSub?.unsubscribe();
      this.pollingSub = undefined;
      this.stopTimeout = undefined;
    }, 300);
  }

  private pingIfAllowed(): Observable<void> {
    const now = Date.now();

    if (this.pingInProgress) return EMPTY;

    if (now - this.lastPingAt < this.HEALTH_REFRESH_INTERVAL) {
      return EMPTY;
    }

    this.lastPingAt = now;
    this.pingInProgress = true;

    return this.pingApi().pipe(
      catchError(() => EMPTY),
      finalize(() => {
        this.pingInProgress = false;
      }),
    );
  }
}
