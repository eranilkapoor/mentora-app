export class ApiResponse<T> {
  constructor(
    public success: boolean,
    public code: string,
    public message?: string,
    public data?: T,
    public errors?: unknown[],
    public meta?: Record<string, any>,
  ) {}
}
