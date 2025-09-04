import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment.prod';
import type { GetUsersDTO } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.api + 'users';

  usersResource = httpResource<undefined | GetUsersDTO>(() => {
    return { url: `${this.apiUrl}/`, method: 'GET' };
  });
}
