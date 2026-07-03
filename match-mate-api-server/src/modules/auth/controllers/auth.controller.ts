import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  Delete,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import {
  RegisterDto,
  LoginDto,
  PhoneSendOtpDto,
  PhoneVerifyDto,
  SocialLoginDto,
  ForgotPasswordDto,
  ResetPasswordCodeExchangeDto,
  ResetPasswordDto,
  ChangePasswordDto,
  MagicLinkRequestDto,
  MagicLinkVerifyDto,
  TwoFactorCodeDto,
  TwoFactorVerifyDto,
} from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AppRequest } from '@/common/interfaces/app-request.interface';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { ErrorCode, SuccessCode } from '@/common/constants';
import { AppLogger } from '@/common/logger/logger.service';
import { successResponse } from '@/common/utils/response.util';
import { AppException } from '@/common/exceptions/app.exception';
import { throwUnauthorized } from '@/common/exceptions/throw-app-exception';
import { RateLimit } from '@/common/decorators/rate-limit.decorator';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: AppLogger,
  ) {}

  @Public()
  @RateLimit({
    name: 'auth-register',
    ttl: 3600,
    limit: 5,
    message: 'Too many registration attempts. Try again later.',
  })
  @Post('register')
  async register(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterDto,
  ) {
    const data = await this.authService.register(req, res, dto);
    return successResponse(
      data,
      SuccessCode.AUTH_REGISTERED,
      'User registered successfully',
    );
  }

  @Public()
  @RateLimit({
    name: 'auth-login',
    ttl: 900,
    limit: 10,
    message: 'Too many login attempts. Try again later.',
  })
  @Post('login')
  async login(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDto,
  ) {
    req.res = res;
    const data = await this.authService.login(req, res, dto);
    return successResponse(
      data,
      SuccessCode.AUTH_LOGIN_SUCCESS,
      'Login successful',
    );
  }

  @Public()
  @RateLimit({
    name: 'auth-send-otp',
    ttl: 600,
    limit: 5,
    message: 'Too many OTP requests. Try again later.',
  })
  @Post('send-otp')
  async sendOtp(@Body() dto: PhoneSendOtpDto) {
    const data = await this.authService.sendOtp(dto.country_code, dto.phone);
    return successResponse(
      data,
      SuccessCode.AUTH_OTP_SENT,
      'OTP sent successfully',
    );
  }

  @Public()
  @RateLimit({
    name: 'auth-verify-otp',
    ttl: 600,
    limit: 10,
    message: 'Too many OTP verification attempts. Try again later.',
  })
  @Post('verify-otp')
  async verifyOtp(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: PhoneVerifyDto,
  ) {
    const data = await this.authService.verifyOtp(
      req,
      res,
      dto.country_code,
      dto.phone,
      dto.otp,
      dto.referralCode,
    );
    return successResponse(
      data,
      SuccessCode.AUTH_OTP_VERIFIED,
      'OTP verified successfully',
    );
  }

  @Public()
  @RateLimit({
    name: 'auth-social-login',
    ttl: 900,
    limit: 20,
    message: 'Too many social login attempts. Try again later.',
  })
  @Post('social-login')
  async socialLogin(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SocialLoginDto,
  ) {
    const data = await this.authService.socialLogin(req, res, dto);
    return successResponse(
      data,
      SuccessCode.AUTH_LOGIN_SUCCESS,
      'Social login successful',
    );
  }

  @Public()
  @RateLimit({
    name: 'auth-forgot-password',
    ttl: 3600,
    limit: 5,
    message: 'Too many password reset requests. Try again later.',
  })
  @Post('forgot-password')
  async forgotPassword(@Req() req: AppRequest, @Body() dto: ForgotPasswordDto) {
    const data = await this.authService.forgotPassword(req, dto.email);
    return successResponse(
      data,
      SuccessCode.AUTH_PASSWORD_RESET_SENT,
      'Password reset link sent to email',
    );
  }

  @Public()
  @RateLimit({
    name: 'auth-reset-exchange',
    ttl: 900,
    limit: 10,
    message: 'Too many reset-code attempts. Try again later.',
  })
  @Post('reset-password/exchange-code')
  async exchangeResetPasswordCode(
    @Req() req: AppRequest,
    @Body() dto: ResetPasswordCodeExchangeDto,
  ) {
    const data = await this.authService.exchangeResetPasswordCode(
      req,
      dto.code,
    );
    return successResponse(
      data,
      SuccessCode.AUTH_LOGIN_SUCCESS,
      'Reset password code exchanged successfully',
    );
  }

  @Public()
  @RateLimit({
    name: 'auth-reset-password',
    ttl: 900,
    limit: 10,
    message: 'Too many password reset attempts. Try again later.',
  })
  @Post('reset-password')
  async resetPassword(@Req() req: AppRequest, @Body() dto: ResetPasswordDto) {
    const data = await this.authService.resetPassword(req, dto);
    return successResponse(
      data,
      SuccessCode.AUTH_PASSWORD_RESET_SUCCESS,
      'Password has been reset successfully',
    );
  }

  @Public()
  @RateLimit({
    name: 'auth-magic-link-request',
    ttl: 900,
    limit: 5,
    message: 'Too many magic-link requests. Try again later.',
  })
  @Post('magic-link/request')
  async requestMagicLink(
    @Req() req: AppRequest,
    @Body() dto: MagicLinkRequestDto,
  ) {
    const data = await this.authService.requestMagicLink(req, dto.email);
    return successResponse(
      data,
      SuccessCode.AUTH_MAGIC_LINK_SENT,
      'Magic sign-in link sent successfully',
    );
  }

  @Public()
  @RateLimit({
    name: 'auth-magic-link-verify',
    ttl: 900,
    limit: 10,
    message: 'Too many magic-link verification attempts. Try again later.',
  })
  @Post('magic-link/verify')
  async verifyMagicLink(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: MagicLinkVerifyDto,
  ) {
    const data = await this.authService.verifyMagicLink(req, res, dto.token);
    return successResponse(
      data,
      SuccessCode.AUTH_MAGIC_LINK_VERIFIED,
      'Magic sign-in link verified successfully',
    );
  }

  @Get('2fa/status')
  async getTwoFactorStatus(@Req() req: AuthenticatedRequest) {
    const data = await this.authService.getTwoFactorStatus(req.user.sub);
    return successResponse(
      data,
      SuccessCode.AUTH_LOGIN_SUCCESS,
      '2FA status fetched',
    );
  }

  @Post('2fa/totp/setup')
  async setupTotp(@Req() req: AuthenticatedRequest) {
    const data = await this.authService.setupTotp(req.user.sub);
    return successResponse(
      data,
      SuccessCode.AUTH_LOGIN_SUCCESS,
      'Authenticator setup started',
    );
  }

  @Post('2fa/totp/enable')
  async enableTotp(
    @Req() req: AuthenticatedRequest,
    @Body() dto: TwoFactorCodeDto,
  ) {
    const data = await this.authService.enableTotp(req.user.sub, dto.code);
    return successResponse(
      data,
      SuccessCode.AUTH_LOGIN_SUCCESS,
      'Authenticator enabled',
    );
  }

  @Post('2fa/sms/request')
  async requestSmsTwoFactor(@Req() req: AuthenticatedRequest) {
    const data = await this.authService.requestSmsTwoFactor(req.user.sub);
    return successResponse(data, SuccessCode.AUTH_OTP_SENT, '2FA OTP sent');
  }

  @Post('2fa/sms/enable')
  async enableSmsTwoFactor(
    @Req() req: AuthenticatedRequest,
    @Body() dto: TwoFactorCodeDto,
  ) {
    const data = await this.authService.enableSmsTwoFactor(
      req.user.sub,
      dto.code,
    );
    return successResponse(
      data,
      SuccessCode.AUTH_LOGIN_SUCCESS,
      'SMS 2FA enabled',
    );
  }

  @Post('2fa/disable')
  async disableTwoFactor(
    @Req() req: AuthenticatedRequest,
    @Body() dto: Partial<TwoFactorCodeDto>,
  ) {
    const data = await this.authService.disableTwoFactor(
      req.user.sub,
      dto.code,
    );
    return successResponse(
      data,
      SuccessCode.AUTH_LOGIN_SUCCESS,
      '2FA disabled',
    );
  }

  @Post('2fa/recovery-codes/regenerate')
  async regenerateRecoveryCodes(
    @Req() req: AuthenticatedRequest,
    @Body() dto: TwoFactorCodeDto,
  ) {
    const data = await this.authService.regenerateRecoveryCodes(
      req.user.sub,
      dto.code,
    );
    return successResponse(
      data,
      SuccessCode.AUTH_LOGIN_SUCCESS,
      'Recovery codes regenerated',
    );
  }

  @Public()
  @RateLimit({
    name: 'auth-two-factor-verify',
    ttl: 900,
    limit: 10,
    message: 'Too many two-factor verification attempts. Try again later.',
  })
  @Post('2fa/verify')
  async verifyTwoFactor(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: TwoFactorVerifyDto,
  ) {
    const data = await this.authService.verifyTwoFactorChallenge(req, res, dto);
    return successResponse(
      data,
      SuccessCode.AUTH_LOGIN_SUCCESS,
      '2FA verified',
    );
  }

  @Post('change-password')
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    const data = await this.authService.changePassword(req, req.user.sub, dto);
    return successResponse(
      data,
      SuccessCode.AUTH_PASSWORD_CHANGED,
      'Password changed successfully',
    );
  }

  @Get('verify-user')
  async verifyUser(@CurrentUser('sub') userId: string) {
    const data = await this.authService.verifyUser(userId);
    return successResponse(
      data,
      SuccessCode.AUTH_EMAIL_VERIFIED,
      'User verified successfully',
    );
  }

  private extractRefreshToken(req: AppRequest): string {
    const tokenFromCookie = req.cookies?.refreshToken as string | undefined;

    const tokenFromBody = (
      req.body as {
        refreshToken?: string;
      }
    )?.refreshToken;

    const tokenFromHeader = req.headers['x-refresh-token'] as
      | string
      | undefined;

    const refreshToken = tokenFromCookie ?? tokenFromBody ?? tokenFromHeader;

    if (!refreshToken) {
      return throwUnauthorized(ErrorCode.AUTH_INVALID_REFRESH_TOKEN);
    }

    return refreshToken;
  }

  @Public()
  @RateLimit({
    name: 'auth-refresh',
    ttl: 300,
    limit: 30,
    message: 'Too many token refresh attempts. Try again later.',
  })
  @Post('refresh')
  async refresh(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const refreshToken = this.extractRefreshToken(req);

      return await this.authService.refresh(req, res, refreshToken);
    } catch (error) {
      this.logger.error(
        `Refresh token failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof AppException) {
        throw error;
      }

      return throwUnauthorized(ErrorCode.AUTH_INVALID_REFRESH_TOKEN);
    }
  }

  @Public()
  @Post('logout')
  async logout(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const refreshToken = this.extractRefreshToken(req);

      await this.authService.logout(req, refreshToken);

      res.clearCookie('refreshToken', {
        ...this.authService.getRefreshCookieOptions(),
      });

      return successResponse(
        null,
        SuccessCode.AUTH_LOGOUT_SUCCESS,
        'Logged out successfully',
      );
    } catch (error) {
      if (error instanceof AppException) {
        res.clearCookie('refreshToken', {
          ...this.authService.getRefreshCookieOptions(),
        });

        return successResponse(
          null,
          SuccessCode.AUTH_LOGOUT_SUCCESS,
          'Logged out successfully',
        );
      }

      throw error;
    }
  }

  @Post('logout-all')
  async logoutAll(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(req, req.user.sub);

    res.clearCookie('refreshToken', {
      ...this.authService.getRefreshCookieOptions(),
    });

    return successResponse(
      null,
      SuccessCode.AUTH_LOGOUT_SUCCESS,
      'Logged out from all devices successfully',
    );
  }

  @Get('sessions')
  async listSessions(@Req() req: AuthenticatedRequest) {
    const data = await this.authService.listSessions(req.user.sub);
    return successResponse(
      data,
      SuccessCode.AUTH_LOGIN_SUCCESS,
      'Active sessions fetched successfully',
    );
  }

  @Delete('sessions/:sessionId')
  async logoutSession(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ) {
    const data = await this.authService.logoutSession(
      req,
      req.user.sub,
      sessionId,
    );
    return successResponse(
      data,
      SuccessCode.AUTH_LOGOUT_SUCCESS,
      'Device signed out successfully',
    );
  }
}
