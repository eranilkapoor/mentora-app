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

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterDto,
  ) {
    try {
      const data = await this.authService.register(req, res, dto);
      return new ApiResponse(true, 'User registered successfully', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      return new ApiResponse(false, message);
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
      return new ApiResponse(true, 'Login successful', data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return new ApiResponse(false, message);
    }
  }

  @Public()
  @Post('send-otp')
  sendOtp(@Body() dto: PhoneSendOtpDto) {
    try {
      const data = this.authService.sendOtp(dto.country_code, dto.phone);
      return new ApiResponse(true, 'OTP sent successfully', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send OTP';
      return new ApiResponse(false, message);
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
      return new ApiResponse(true, 'OTP verified successfully', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'OTP verification failed';
      return new ApiResponse(false, message);
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
      return new ApiResponse(true, 'Social login successful', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Social login failed';
      return new ApiResponse(false, message);
    }
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Req() req: AppRequest, @Body() dto: ForgotPasswordDto) {
    try {
      const data = await this.authService.forgotPassword(req, dto.email);
      return new ApiResponse(true, 'Password reset link sent to email', data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to process password reset';
      return new ApiResponse(false, message);
    }
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Req() req: AppRequest, @Body() dto: ResetPasswordDto) {
    try {
      const data = await this.authService.resetPassword(req, dto);
      return new ApiResponse(
        true,
        'Password has been reset successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Password reset failed';
      return new ApiResponse(false, message);
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
      return new ApiResponse(true, 'Password changed successfully', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to change password';
      return new ApiResponse(false, message);
    }
  }

  @Get('verify-user')
  async verifyUser(@CurrentUser('sub') userId: string) {
    try {
      const data = await this.authService.verifyUser(userId);
      return new ApiResponse(true, 'User verified successfully', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to verify user';
      return new ApiResponse(false, message);
    }
  }

  @Post('refresh')
  refresh(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    // @Body('refreshToken') refreshToken?: string,
  ) {
    // Web: read from cookie
    // Mobile: read from Authorization header or request body
    const tokenFromCookie = req.cookies?.refreshTtoken as string | undefined;
    const tokenFromBody = (req.body as { refreshTtoken?: string })
      .refreshTtoken;
    const tokenFromHeader = req.headers['x-refresh-token'] as
      | string
      | undefined;

    const refreshToken = tokenFromCookie ?? tokenFromBody ?? tokenFromHeader;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return this.authService.refresh(req, res, refreshToken);
  }

  @Post('refresh')
  refreshMobile(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    // @Body('refreshToken') refreshToken: string,
  ) {
    // Web: read from cookie
    // Mobile: read from Authorization header or request body
    const tokenFromCookie = req.cookies?.refreshTtoken as string | undefined;
    const tokenFromBody = (req.body as { refreshTtoken?: string })
      .refreshTtoken;
    const tokenFromHeader = req.headers['x-refresh-token'] as
      | string
      | undefined;

    const refreshToken = tokenFromCookie ?? tokenFromBody ?? tokenFromHeader;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return this.authService.refresh(req, res, refreshToken);
  }

  @Post('logout')
  logout(
    @Req() req: AuthenticatedRequest,
    @Body('refreshToken') refreshToken: string,
  ) {
    try {
      return this.authService.logout(req, req.user.sub, refreshToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      return new ApiResponse(false, message);
    }
  }

  @Post('logout-all')
  logoutAll(@Req() req: AuthenticatedRequest) {
    return this.authService.logoutAll(req, req.user.sub);
  }
}
