import { HttpClient } from '@angular/common/http';
import type { OnDestroy } from '@angular/core';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, EMPTY, finalize, tap } from 'rxjs';

import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class HealthService implements OnDestroy {
  private readonly http = inject(HttpClient);

  private readonly HEALTH_REFRESH_INTERVAL = 15_000;
  private readonly DELAYED_HEALTH_PING_DELAY = 45_000;

  private lastPingAt = 0;
  private pingInProgress = false;

  private delayedPingTimeout?: ReturnType<typeof setTimeout>;

  ngOnDestroy(): void {
    this.clearDelayedPing();
  }

  pingToRefresh(): void {
    this.pingIfAllowed().subscribe();
    this.scheduleDelayedPing();
  }

  scheduleDelayedPing(): void {
    this.clearDelayedPing();

    this.delayedPingTimeout = setTimeout(() => {
      this.delayedPingTimeout = undefined;
      this.pingIfAllowed().subscribe();
    }, this.DELAYED_HEALTH_PING_DELAY);
  }

  private pingIfAllowed(): Observable<void> {
    const now = Date.now();

    if (this.pingInProgress) return EMPTY;
    if (now - this.lastPingAt < this.HEALTH_REFRESH_INTERVAL) return EMPTY;

    this.pingInProgress = true;

    return this.http.get<void>(environment.api + 'health').pipe(
      tap(() => {
        this.lastPingAt = Date.now();
      }),
      catchError(() => EMPTY),
      finalize(() => {
        this.pingInProgress = false;
      }),
    );
  }

  private clearDelayedPing(): void {
    if (!this.delayedPingTimeout) return;

    clearTimeout(this.delayedPingTimeout);
    this.delayedPingTimeout = undefined;
  }
}
