export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone_number?: string | null;
  address?: string | null;
}

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string;
  address?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  message: string;
}
