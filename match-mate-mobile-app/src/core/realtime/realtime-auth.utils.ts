export const isRealtimeAuthError = (error: unknown): boolean => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';

  return /jwt|token|auth|unauthor/i.test(message);
};
