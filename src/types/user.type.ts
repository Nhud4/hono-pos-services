export interface User {
  id: string;
  code: string;
  name: string;
  role: string;
  username: string;
  active: boolean;
  lastLogin?: string;
  companyId?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserRequest {
  name: string;
  role: string;
  username: string;
  password: string;
  companyId?: number;
}

export interface UpdateUserRequest {
  name?: string;
  role?: string;
  username?: string;
  password?: string;
  active?: string;
  companyId?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiredAt: string;
}

export interface RegisterRequest {
  name: string;
  role: string;
  username: string;
  password: string;
  companyId?: number;
}

export interface ListUserRequest {
  page: string;
  size: string;
  search?: string;
}

export interface LoginData {
  id: string;
  role: string;
  username: string;
}
