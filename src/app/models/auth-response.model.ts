import type { UserDoc } from './users-dto.model';

type JwtToken = string;

export interface AuthResponse {
  token: JwtToken;
  user: UserDoc;
}
