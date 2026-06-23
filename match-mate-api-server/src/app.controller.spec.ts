import { AppController } from './app.controller';

describe('AppController', () => {
  const service = {
    getRoot: jest.fn(),
    livenessCheck: jest.fn(),
    readinessCheck: jest.fn(),
    getAccountDeletionInstructionsPage: jest.fn(),
    getStaticHelpPage: jest.fn(),
  };

  let controller: AppController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AppController(service as never);
  });

  it('returns root and liveness responses from AppService', () => {
    service.getRoot.mockReturnValue({ name: 'MatchMate' });
    service.livenessCheck.mockReturnValue({ status: 'ok' });

    expect(controller.getRoot()).toEqual({ name: 'MatchMate' });
    expect(controller.live()).toEqual({ status: 'ok' });
  });

  it('sets HTTP 503 when readiness is not ok', () => {
    const response = { status: jest.fn() };
    service.readinessCheck.mockReturnValue({ status: 'degraded' });

    const readiness = controller.ready(response as never);

    expect(response.status).toHaveBeenCalledWith(503);
    expect(readiness).toEqual({ status: 'degraded' });
  });

  it('renders account deletion instructions with static page preferences', () => {
    service.getAccountDeletionInstructionsPage.mockReturnValue('<html></html>');

    const html = controller.accountDeletionInstructions(
      'dark',
      'hi',
      'large',
      'true',
      'true',
      'false',
    );

    expect(service.getAccountDeletionInstructionsPage).toHaveBeenCalledWith({
      theme: 'dark',
      language: 'hi',
      fontSize: 'large',
      boldText: 'true',
      highContrast: 'true',
      reduceMotion: 'false',
    });
    expect(html).toBe('<html></html>');
  });

  it.each([
    ['privacy-policy', 'privacyPolicy'],
    ['terms-conditions', 'termsConditions'],
    ['community-guidelines', 'communityGuidelines'],
    ['faqs', 'faqs'],
  ] as const)('renders the %s static help page', (slug, methodName) => {
    service.getStaticHelpPage.mockReturnValue(`<html>${slug}</html>`);

    const html = controller[methodName](
      'light',
      'en',
      'medium',
      'false',
      'false',
      'true',
    );

    expect(service.getStaticHelpPage).toHaveBeenCalledWith(slug, {
      theme: 'light',
      language: 'en',
      fontSize: 'medium',
      boldText: 'false',
      highContrast: 'false',
      reduceMotion: 'true',
    });
    expect(html).toBe(`<html>${slug}</html>`);
  });
});
