import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
import { AppService } from './app.service';
import { Public } from '@/common/decorators/public.decorator';
import { SkipRateLimit } from '@/common/decorators/skip-rate-limit.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // ==========================================
  // ROOT (basic info)
  // ==========================================
  @Public()
  @Get()
  getRoot() {
    return this.appService.getRoot();
  }

  @Public()
  @SkipThrottle()
  @SkipRateLimit()
  @Get('live')
  live() {
    return this.appService.livenessCheck();
  }

  @Public()
  @SkipThrottle()
  @SkipRateLimit()
  @Get('ready')
  ready(@Res({ passthrough: true }) response: Response) {
    const readiness = this.appService.readinessCheck();

    if (readiness.status !== 'ok') {
      response.status(503);
    }

    return readiness;
  }

  @Public()
  @SkipThrottle()
  @SkipRateLimit()
  @Get('account-deletion')
  @Header('Content-Type', 'text/html; charset=utf-8')
  accountDeletionInstructions() {
    return this.appService.getAccountDeletionInstructionsPage();
  }

  @Public()
  @SkipThrottle()
  @SkipRateLimit()
  @Get('privacy-policy')
  @Header('Content-Type', 'text/html; charset=utf-8')
  privacyPolicy(@Query('theme') theme?: string, @Query('lang') lang?: string) {
    return this.appService.getStaticHelpPage('privacy-policy', theme, lang);
  }

  @Public()
  @SkipThrottle()
  @SkipRateLimit()
  @Get('terms-conditions')
  @Header('Content-Type', 'text/html; charset=utf-8')
  termsConditions(
    @Query('theme') theme?: string,
    @Query('lang') lang?: string,
  ) {
    return this.appService.getStaticHelpPage('terms-conditions', theme, lang);
  }

  @Public()
  @SkipThrottle()
  @SkipRateLimit()
  @Get('community-guidelines')
  @Header('Content-Type', 'text/html; charset=utf-8')
  communityGuidelines(
    @Query('theme') theme?: string,
    @Query('lang') lang?: string,
  ) {
    return this.appService.getStaticHelpPage(
      'community-guidelines',
      theme,
      lang,
    );
  }

  @Public()
  @SkipThrottle()
  @SkipRateLimit()
  @Get('faqs')
  @Header('Content-Type', 'text/html; charset=utf-8')
  faqs(@Query('theme') theme?: string, @Query('lang') lang?: string) {
    return this.appService.getStaticHelpPage('faqs', theme, lang);
  }
}
