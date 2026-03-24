import { Controller, Post, Body, UseGuards } from '@nestjs/common';
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
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      const data = await this.authService.register(dto);
      return new ApiResponse(true, 'User registered successfully', data);
    } catch (error) {
      return new ApiResponse(false, error.message || 'Registration failed');
    }
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      const data = await this.authService.login(dto);
      return new ApiResponse(true, 'Login successful', data);
    } catch (error) {
      return new ApiResponse(false, error.message || 'Login failed');
    }
  }

  @Public()
  @Post('send-otp')
  async sendOtp(@Body() dto: PhoneSendOtpDto) {
    try {
      const data = await this.authService.sendOtp(dto.country_code, dto.phone);
      return new ApiResponse(true, 'OTP sent successfully', data);
    } catch (error) {
      return new ApiResponse(false, error.message || 'Failed to send OTP');
    }
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() dto: PhoneVerifyDto) {
    try {
      const data = await this.authService.verifyOtp(dto.country_code, dto.phone, dto.otp);
      return new ApiResponse(true, 'OTP verified successfully', data);
    } catch (error) {
      return new ApiResponse(false, error.message || 'OTP verification failed');
    }
  }

  @Public()
  @Post('social-login')
  async socialLogin(@Body() dto: SocialLoginDto) {
    try {
      const data = await this.authService.socialLogin(dto);
      return new ApiResponse(true, 'Social login successful', data);
    } catch (error) {
      return new ApiResponse(false, error.message || 'Social login failed');
    }
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: { email: string }) {
    try {
      const data = await this.authService.forgotPassword(dto.email);
      return new ApiResponse(true, 'Password reset instructions sent', data);
    } catch (error) {
      return new ApiResponse(false, error.message || 'Failed to process password reset');
    }
  }

  @Post('onboarding-profile')
  async onboardingProfile(@CurrentUser('userId') userId: string, @Body() dto: OnboardingProfileDto) {
    try {
      const data = await this.authService.onboardingProfile(userId, dto);
      return new ApiResponse(true, 'Onboarding profile saved successfully', data);
    } catch (error) {
      return new ApiResponse(false, error.message || 'Failed to save onboarding profile');
    }
  }

  @Post('logout')
  async logout(@Body('userId') userId: string) {
    try {
      return await this.authService.logout(userId);
    } catch (error) {
      return new ApiResponse(false, error.message || 'Logout failed');
    }
  }
}
