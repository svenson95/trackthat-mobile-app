export type UserId = string; // mongodb doc id

export interface User {
  googleId: string;
  name: string;
  picture: string;
  email: string;
  weight: number;
  height: number;
}

export interface UserDoc extends User {
  readonly id: UserId;
}

export type GetUsersResponse = Array<UserDoc>;
