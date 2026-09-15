import type { GoogleJWT } from '../../../core';
import type { UserDoc } from '../../../shared';

export type JwtToken = string;

export type GetAuthBody = { token: GoogleJWT };
export type GetAuthResponse = {
  token: JwtToken;
  user: UserDoc;
};
