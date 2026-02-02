export interface JwtUser {
  id: string;
  email?: string;
  phone?: string;
  role?: string;
  iat?: number;
  exp?: number;
}
