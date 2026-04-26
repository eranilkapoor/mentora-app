export class ApiResponse<T> {
  constructor(
    public success: boolean,
    public code: string,
    public data?: T,
    public message?: string,
    public errors?: unknown[],
    public meta?: Record<string, any>
  ) {}
}
