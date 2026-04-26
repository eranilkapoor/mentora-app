import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    public code: string,
    status: HttpStatus,
    public data?: unknown,
    public errors?: unknown[],
    public meta?: Record<string, any>
  ) {
    super(
      {
        success: false,
        code,
        data: data || null,
        errors: errors || null,
        meta: meta || null,
      },
      status,
    );
  }
}