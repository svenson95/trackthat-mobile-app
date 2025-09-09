import type { UserDoc } from '../database/users.model';
import type { GoogleJWT } from './google.model';

export type JwtToken = string;

export type GetAuthBody = { token: GoogleJWT };
export type GetAuthResponse = {
  token: JwtToken;
  user: UserDoc;
};
