export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

export interface RegisterResponse {
  accessToken: string;
  user: AuthUser;
  apiKey: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ApiErrorBody {
  statusCode?: number;
  message?: string;
  error?: string;
  details?: unknown;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
  /** Present when the last successful auth was `register` (or if API returns it elsewhere). */
  apiKey?: string;
}
