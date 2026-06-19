import {
  Controller,
  Get,
  Header,
  Query,
  Res,
  VERSION_NEUTRAL,
  Version,
} from '@nestjs/common';
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
  @Version(VERSION_NEUTRAL)
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Cache-Control', 'public, max-age=300')
  accountDeletionInstructions(
    @Query('theme') theme?: string,
    @Query('lang') lang?: string,
  ) {
    return this.appService.getAccountDeletionInstructionsPage(theme, lang);
  }

  @Public()
  @SkipThrottle()
  @SkipRateLimit()
  @Get('privacy-policy')
  @Version(VERSION_NEUTRAL)
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Cache-Control', 'public, max-age=300')
  privacyPolicy(@Query('theme') theme?: string, @Query('lang') lang?: string) {
    return this.appService.getStaticHelpPage('privacy-policy', theme, lang);
  }

  @Public()
  @SkipThrottle()
  @SkipRateLimit()
  @Get('terms-conditions')
  @Version(VERSION_NEUTRAL)
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Cache-Control', 'public, max-age=300')
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
  @Version(VERSION_NEUTRAL)
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Cache-Control', 'public, max-age=300')
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
  @Version(VERSION_NEUTRAL)
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Cache-Control', 'public, max-age=300')
  faqs(@Query('theme') theme?: string, @Query('lang') lang?: string) {
    return this.appService.getStaticHelpPage('faqs', theme, lang);
  }
}
