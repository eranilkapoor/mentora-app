import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants';
import { AppException } from './app.exception';

export const throwAppException = (
  code: ErrorCode,
  status: HttpStatus,
  meta?: Record<string, unknown>,
): never => {
  throw new AppException(code, status, null, undefined, meta);
};

export const throwBadRequest = (
  code: ErrorCode = ErrorCode.INVALID_REQUEST,
  meta?: Record<string, unknown>,
): never => throwAppException(code, HttpStatus.BAD_REQUEST, meta);

export const throwUnauthorized = (
  code: ErrorCode = ErrorCode.AUTH_UNAUTHORIZED,
  meta?: Record<string, unknown>,
): never => throwAppException(code, HttpStatus.UNAUTHORIZED, meta);

export const throwForbidden = (
  code: ErrorCode = ErrorCode.AUTH_FORBIDDEN,
  meta?: Record<string, unknown>,
): never => throwAppException(code, HttpStatus.FORBIDDEN, meta);

export const throwNotFound = (
  code: ErrorCode = ErrorCode.ENDPOINT_NOT_FOUND,
  meta?: Record<string, unknown>,
): never => throwAppException(code, HttpStatus.NOT_FOUND, meta);

export const throwConflict = (
  code: ErrorCode = ErrorCode.INVALID_REQUEST,
  meta?: Record<string, unknown>,
): never => throwAppException(code, HttpStatus.CONFLICT, meta);
