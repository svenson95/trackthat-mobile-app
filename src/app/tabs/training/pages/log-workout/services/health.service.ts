import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable, Subscription } from 'rxjs';
import { catchError, EMPTY, interval, startWith, switchMap } from 'rxjs';

import { environment } from '../../../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly HEALTH_REFRESH_INTERVAL = 15_000;
  private pollingSub?: Subscription;

  pingApi = (): Observable<void> => this.http.get<void>(`${environment.api}/health`);

  startPolling(): void {
    if (this.pollingSub) return;
    this.pollingSub = interval(this.HEALTH_REFRESH_INTERVAL)
      .pipe(
        startWith(0),
        switchMap(() => this.pingApi().pipe(catchError(() => EMPTY))),
      )
      .subscribe();
  }

  stopPolling(): void {
    this.pollingSub?.unsubscribe();
    this.pollingSub = undefined;
  }
}
