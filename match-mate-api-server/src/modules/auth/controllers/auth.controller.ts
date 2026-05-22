import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from 'src/common/dto/api-response.dto';
import {
  RegisterDto,
  LoginDto,
  PhoneSendOtpDto,
  PhoneVerifyDto,
  SocialLoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AppRequest } from 'src/common/interfaces/app-request.interface';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { ErrorCode, SuccessCode } from 'src/common/constants';
import { AppLogger } from 'src/common/logger/logger.service';

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
    try {
      const data = await this.authService.register(req, res, dto);
      return new ApiResponse(
        true,
        SuccessCode.AUTH_REGISTERED,
        'User registered successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      return new ApiResponse(false, ErrorCode.INTERNAL_ERROR, message, null);
    }
  }

  @Public()
  @Post('login')
  async login(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDto,
  ) {
    req.res = res;
    try {
      const data = await this.authService.login(req, res, dto);
      return new ApiResponse(
        true,
        SuccessCode.AUTH_LOGIN_SUCCESS,
        'Login successful',
        data,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return new ApiResponse(
        false,
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        message,
        null,
      );
    }
  }

  @Public()
  @Post('send-otp')
  sendOtp(@Body() dto: PhoneSendOtpDto) {
    try {
      const data = this.authService.sendOtp(dto.country_code, dto.phone);
      return new ApiResponse(
        true,
        SuccessCode.AUTH_OTP_SENT,
        'OTP sent successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send OTP';
      return new ApiResponse(false, ErrorCode.INTERNAL_ERROR, message, null);
    }
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: PhoneVerifyDto,
  ) {
    try {
      const data = await this.authService.verifyOtp(
        req,
        res,
        dto.country_code,
        dto.phone,
        dto.otp,
      );
      return new ApiResponse(
        true,
        SuccessCode.AUTH_OTP_VERIFIED,
        'OTP verified successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'OTP verification failed';
      return new ApiResponse(false, ErrorCode.INTERNAL_ERROR, message, null);
    }
  }

  @Public()
  @Post('social-login')
  async socialLogin(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SocialLoginDto,
  ) {
    try {
      const data = await this.authService.socialLogin(req, res, dto);
      return new ApiResponse(
        true,
        SuccessCode.AUTH_LOGIN_SUCCESS,
        'Social login successful',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Social login failed';
      return new ApiResponse(false, ErrorCode.INTERNAL_ERROR, message, null);
    }
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Req() req: AppRequest, @Body() dto: ForgotPasswordDto) {
    try {
      const data = await this.authService.forgotPassword(req, dto.email);
      return new ApiResponse(
        true,
        SuccessCode.AUTH_PASSWORD_RESET_SENT,
        'Password reset link sent to email',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to process password reset';
      return new ApiResponse(false, ErrorCode.INTERNAL_ERROR, message, null);
    }
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Req() req: AppRequest, @Body() dto: ResetPasswordDto) {
    try {
      const data = await this.authService.resetPassword(req, dto);
      return new ApiResponse(
        true,
        SuccessCode.AUTH_PASSWORD_RESET_SUCCESS,
        'Password has been reset successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Password reset failed';
      return new ApiResponse(false, ErrorCode.INTERNAL_ERROR, message, null);
    }
  }

  @Post('change-password')
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    try {
      const data = await this.authService.changePassword(
        req,
        req.user.sub,
        dto,
      );
      return new ApiResponse(
        true,
        SuccessCode.AUTH_PASSWORD_CHANGED,
        'Password changed successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to change password';
      return new ApiResponse(false, ErrorCode.INTERNAL_ERROR, message, null);
    }
  }

  @Get('verify-user')
  async verifyUser(@CurrentUser('sub') userId: string) {
    try {
      const data = await this.authService.verifyUser(userId);
      return new ApiResponse(
        true,
        SuccessCode.AUTH_EMAIL_VERIFIED,
        'User verified successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to verify user';
      return new ApiResponse(false, ErrorCode.INTERNAL_ERROR, message, null);
    }
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
      throw new UnauthorizedException('Refresh token not found');
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

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Unable to refresh access token');
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

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Unable to refresh access token');
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
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return new ApiResponse(
        true,
        SuccessCode.AUTH_LOGOUT_SUCCESS,
        'Logged out successfully',
        null,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      return new ApiResponse(false, ErrorCode.INTERNAL_ERROR, message, null);
    }
  }

  @Post('logout-all')
  async logoutAll(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      await this.authService.logoutAll(req, req.user.sub);

      res.clearCookie('refreshToken');

      return new ApiResponse(
        true,
        SuccessCode.AUTH_LOGOUT_SUCCESS,
        'Logged out from all devices successfully',
        null,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';

      return new ApiResponse(false, ErrorCode.INTERNAL_ERROR, message, null);
    }
  }
}
