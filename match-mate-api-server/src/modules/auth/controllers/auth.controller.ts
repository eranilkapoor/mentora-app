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
  ResetPasswordDto,
  ChangePasswordDto,
  MagicLinkRequestDto,
  MagicLinkVerifyDto,
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

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: AppLogger,
  ) {}

  @Public()
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
  @Post('refresh/mobile')
  async refreshMobile(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const refreshToken = this.extractRefreshToken(req);

      return await this.authService.refresh(req, res, refreshToken);
    } catch (error) {
      this.logger.error(
        `Mobile refresh token failed: ${
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

      if (refreshToken) {
        await this.authService.logout(req, refreshToken);
      }

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
