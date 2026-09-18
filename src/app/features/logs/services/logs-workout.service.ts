import { httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment.prod';
import type { GetLogsWorkoutDTO } from '../../../core';
import { UserService } from '../../../core';

@Injectable()
export class LogsWorkoutService {
  private readonly apiUrl = environment.api + 'logs-workout';
  private readonly userService = inject(UserService);

  readonly allLogsWorkoutResource = httpResource<GetLogsWorkoutDTO>(() => {
    const userId = this.userService.userData()?.id;
    if (!userId) return undefined;
    return { url: `${this.apiUrl}/get/all/${userId}`, method: 'GET' };
  });
}
