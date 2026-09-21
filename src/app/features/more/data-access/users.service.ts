import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import type { GetUsersResponse } from '../../../core';

@Injectable()
export class UsersService {
  private readonly apiUrl = environment.api + 'users';

  readonly allUsersResource = httpResource<GetUsersResponse>(() => ({
    url: `${this.apiUrl}/`,
    method: 'GET',
  }));
}
