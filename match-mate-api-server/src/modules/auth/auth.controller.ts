import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiResponse } from 'src/common/response.dto';
import {
  RegisterDto,
  LoginDto,
  PhoneSendOtpDto,
  PhoneVerifyDto,
  SocialLoginDto,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/modules/auth/decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { OnboardingProfileDto } from './dto/onboarding-profile.dto';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      const data = await this.authService.register(dto);
      return new ApiResponse(true, 'User registered successfully', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      return new ApiResponse(false, message);
    }
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      const data = await this.authService.login(dto);
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
  async verifyOtp(@Body() dto: PhoneVerifyDto) {
    try {
      const data = await this.authService.verifyOtp(
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
  async socialLogin(@Body() dto: SocialLoginDto) {
    try {
      const data = await this.authService.socialLogin(dto);
      return new ApiResponse(true, 'Social login successful', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Social login failed';
      return new ApiResponse(false, message);
    }
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: { email: string }) {
    try {
      const data = await this.authService.forgotPassword(dto.email);
      return new ApiResponse(true, 'Password reset instructions sent', data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to process password reset';
      return new ApiResponse(false, message);
    }
  }

  @Post('onboarding-profile')
  async onboardingProfile(
    @CurrentUser('userId') userId: string,
    @Body() dto: OnboardingProfileDto,
  ) {
    try {
      const data = await this.authService.onboardingProfile(userId, dto);
      return new ApiResponse(
        true,
        'Onboarding profile saved successfully',
        data,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to save onboarding profile';
      return new ApiResponse(false, message);
    }
  }

  @Get('verify-user')
  async verifyUser(@CurrentUser('userId') userId: string) {
    try {
      const data = await this.authService.verifyUser(userId);
      return new ApiResponse(true, 'User verified successfully', data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to verify user';
      return new ApiResponse(false, message);
    }
  }

  @Post('logout')
  logout() {
    try {
      return this.authService.logout();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      return new ApiResponse(false, message);
    }
  }
}
