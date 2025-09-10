import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import { tap, type Observable } from 'rxjs';

import { environment } from '../../../environments/environment.prod';
import type {
  GetUsersResponse,
  PutUserWorkoutsBody,
  PutUserWorkoutsResponse,
  UserDoc,
  UserId,
} from '../../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.api + 'users';

  private http = inject(HttpClient);

  userData = linkedSignal<undefined | UserDoc>(() => {
    const token = localStorage.getItem('user');
    if (token) return JSON.parse(token);
    return undefined;
  });

  setUser(user: UserDoc | undefined): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userData.set(user);
  }

  clearUser(): void {
    localStorage.removeItem('user');
    this.userData.set(undefined);
  }

  user = computed<UserDoc>(() => {
    const user = this.userData();
    if (!user) throw new Error('Unexpected user undefined');
    return user;
  });

  updateUserWorkoutList(
    userId: UserId,
    workoutIds: PutUserWorkoutsBody,
  ): Observable<PutUserWorkoutsResponse> {
    return this.http
      .put<PutUserWorkoutsResponse>(`${this.apiUrl}/edit/${userId}/update-sorting`, workoutIds)
      .pipe(tap((user) => this.setUser(user)));
  }

  allUsersResource = httpResource<GetUsersResponse>(() => {
    return { url: `${this.apiUrl}/`, method: 'GET' };
  });
}
