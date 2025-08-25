import type { GoogleUser } from './google.model';

type JwtToken = string;

export interface AuthResponse {
  token: JwtToken;
  user: GoogleUser;
}
