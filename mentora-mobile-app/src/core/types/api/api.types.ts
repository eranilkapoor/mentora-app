export type ApiSuccess<T> = {
  success: true;
  code: string;
  message?: string;
  data: T;
  meta?: Record<string, unknown> | null;
};

export type ApiFailure = {
  success: false;
  code: string;
  message?: string;
  data?: null;
  errors?: unknown;
  meta?: Record<string, unknown> | null;
  statusCode?: number;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
