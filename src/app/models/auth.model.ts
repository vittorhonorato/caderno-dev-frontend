export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  email: string;
}

export interface LoginResponse {
  token: string;
}
