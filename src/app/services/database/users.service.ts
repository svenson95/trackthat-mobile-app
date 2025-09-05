import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.prod';
import type { GetUsersDTO, UserDoc, UserId, WorkoutListId } from '../../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.api + 'users';
  private http = inject(HttpClient);

  usersResource = httpResource<undefined | GetUsersDTO>(() => {
    return { url: `${this.apiUrl}/`, method: 'GET' };
  });

  updateUserWorkoutList(userId: UserId, workoutIds: Array<WorkoutListId>): Observable<UserDoc> {
    return this.http.put<UserDoc>(`${this.apiUrl}/edit/${userId}/update-sorting`, workoutIds);
  }
}
