export const successResponse = <T>(
  data: T,
  code = 'COMMON.SUCCESS',
  meta?: Record<string, any>,
) => ({
  success: true,
  code,
  data,
  meta: meta || null,
});
