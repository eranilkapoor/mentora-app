const mockSentry = {
  init: jest.fn<
    void,
    [
      {
        beforeSend: (event: Record<string, unknown>) => Record<string, unknown>;
      },
    ]
  >(),
  wrap: jest.fn((component) => component),
  captureException: jest.fn(),
  setUser: jest.fn(),
};

jest.mock('@sentry/react-native', () => mockSentry);

const loadReporter = (env: Record<string, string | undefined>) => {
  jest.resetModules();
  jest.doMock('./config', () => ({
    getPublicEnv: (key: string) => env[key],
  }));

  return require('./errorReporter') as typeof import('./errorReporter');
};

describe('errorReporter', () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
  const errorSpy = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('stays disabled unless the public feature flag is enabled', () => {
    const reporter = loadReporter({});

    expect(reporter.isErrorReportingEnabled()).toBe(false);
    reporter.initErrorReporting();
    reporter.reportError('offline', {
      email: 'user@example.com',
      nested: { token: 'secret-token' },
    });

    expect(mockSentry.init).not.toHaveBeenCalled();
    expect(mockSentry.captureException).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      '[ErrorReporter]',
      'Error',
      expect.objectContaining({
        email: '[REDACTED]',
        nested: { token: '[REDACTED]' },
      })
    );
  });

  it('warns when Sentry is selected without a DSN', () => {
    const reporter = loadReporter({
      EXPO_PUBLIC_ERROR_REPORTING_ENABLED: 'true',
      EXPO_PUBLIC_ERROR_REPORTING_PROVIDER: 'sentry',
    });

    reporter.initErrorReporting();

    expect(mockSentry.init).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('DSN'));
  });

  it('initializes Sentry, scrubs events, captures errors, and sets anonymous-safe user context', () => {
    const reporter = loadReporter({
      EXPO_PUBLIC_ENV: 'production',
      EXPO_PUBLIC_ERROR_REPORTING_ENABLED: 'true',
      EXPO_PUBLIC_ERROR_REPORTING_PROVIDER: 'sentry',
      EXPO_PUBLIC_SENTRY_DSN: 'https://public@example.test/1',
      EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: '0.25',
    });

    reporter.initErrorReporting();

    expect(mockSentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://public@example.test/1',
        environment: 'production',
        tracesSampleRate: 0.25,
      })
    );

    const beforeSend = mockSentry.init.mock.calls[0]?.[0].beforeSend;
    expect(beforeSend).toBeDefined();
    expect(
      beforeSend?.({
        request: {
          headers: { authorization: 'Bearer abc' },
          url: 'https://x.test?token=abc&safe=1',
        },
        user: { email: 'user@example.com' },
      })
    ).toEqual({
      request: {
        headers: { authorization: '[REDACTED]' },
        url: 'https://x.test?token=[REDACTED]&safe=1',
      },
      user: { email: '[REDACTED]' },
    });

    reporter.reportError({ problem: true }, { route: 'Settings' });
    reporter.setErrorReporterUser({ id: 'user-1', email: 'private@test.com' });
    reporter.setErrorReporterUser(null);

    expect(mockSentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      {
        extra: { route: 'Settings' },
      }
    );
    expect(mockSentry.setUser).toHaveBeenNthCalledWith(1, { id: 'user-1' });
    expect(mockSentry.setUser).toHaveBeenNthCalledWith(2, null);
  });

  it('wraps components only for enabled Sentry reporting', () => {
    const disabled = loadReporter({});
    const Component = () => null;
    expect(disabled.wrapWithErrorReporter(Component)).toBe(Component);

    const enabled = loadReporter({
      EXPO_PUBLIC_ERROR_REPORTING_ENABLED: 'true',
      EXPO_PUBLIC_ERROR_REPORTING_PROVIDER: 'sentry',
    });
    expect(enabled.wrapWithErrorReporter(Component)).toBe(Component);
    expect(mockSentry.wrap).toHaveBeenCalledWith(Component);
  });
});
