import { ApiResponse } from '../dto/api-response.dto';
import { ErrorCode, SuccessCode } from '../constants';

type Envelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: unknown[];
  meta?: Record<string, any>;
};

const isEnvelope = <T>(value: unknown): value is Envelope<T> =>
  typeof value === 'object' &&
  value !== null &&
  'success' in value &&
  ('data' in value || 'meta' in value || 'message' in value);

export const successResponse = <T>(
  data: T | Envelope<T>,
  code: SuccessCode | string = SuccessCode.SUCCESS,
  messageOrMeta?: string | Record<string, any>,
  meta?: Record<string, any>,
): ApiResponse<T> => {
  const message = typeof messageOrMeta === 'string' ? messageOrMeta : undefined;
  const responseMeta = typeof messageOrMeta === 'object' ? messageOrMeta : meta;

  if (isEnvelope<T>(data) && data.success === true) {
    return new ApiResponse(
      true,
      code,
      message ?? data.message,
      data.data,
      undefined,
      data.meta ?? responseMeta,
    );
  }

  return new ApiResponse(
    true,
    code,
    message,
    data as T,
    undefined,
    responseMeta,
  );
};

export const errorResponse = (
  code: ErrorCode | string = ErrorCode.INTERNAL_ERROR,
  message?: string,
  errors?: unknown[],
  meta?: Record<string, any>,
): ApiResponse<null> =>
  new ApiResponse(false, code, message, null, errors, meta);
