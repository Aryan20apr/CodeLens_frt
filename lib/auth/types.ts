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

export interface ApiErrorBody {
  statusCode?: number;
  message?: string;
  error?: string;
  details?: unknown;
}

export interface AuthSession {
  accessToken: string;
  apiKey: string;
  user: AuthUser;
}
