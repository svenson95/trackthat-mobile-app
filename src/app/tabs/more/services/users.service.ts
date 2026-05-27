import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment.prod';
import type { GetUsersResponse } from '../../../shared/models';

@Injectable()
export class UsersService {
  private readonly apiUrl = environment.api + 'users';

  readonly allUsersResource = httpResource<GetUsersResponse>(() => {
    return { url: `${this.apiUrl}/`, method: 'GET' };
  });
}
