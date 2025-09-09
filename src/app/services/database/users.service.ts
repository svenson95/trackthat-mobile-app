import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.prod';
import type {
  GetUsersResponse,
  PutUserWorkoutsBody,
  PutUserWorkoutsResponse,
  UserId,
} from '../../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.api + 'users';
  private http = inject(HttpClient);

  usersResource = httpResource<GetUsersResponse>(() => {
    return { url: `${this.apiUrl}/`, method: 'GET' };
  });

  updateUserWorkoutList(
    userId: UserId,
    workoutIds: PutUserWorkoutsBody,
  ): Observable<PutUserWorkoutsResponse> {
    return this.http.put<PutUserWorkoutsResponse>(
      `${this.apiUrl}/edit/${userId}/update-sorting`,
      workoutIds,
    );
  }
}
