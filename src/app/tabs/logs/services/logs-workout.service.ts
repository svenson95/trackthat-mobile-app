import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { type Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.prod';
import type { GetLogsWorkoutDTO } from '../../../shared/models';

@Injectable()
export class LogsWorkoutService {
  private readonly apiUrl = environment.api + 'logs-workout';
  private readonly http = inject(HttpClient);

  getAllLogsWorkout(date: number, userId: string): Observable<GetLogsWorkoutDTO> {
    return this.http.get<GetLogsWorkoutDTO>(`${this.apiUrl}/get/day/${date}/${userId}`);
  }
}
