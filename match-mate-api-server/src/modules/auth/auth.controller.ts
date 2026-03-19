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
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return new ApiResponse(true, 'User registered successfully', data);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return new ApiResponse(true, 'Login successful', data);
  }

  @Public()
  @Post('send-otp')
  async sendOtp(@Body() dto: PhoneSendOtpDto) {
    const data = await this.authService.sendOtp(dto.country_code, dto.phone);
    return new ApiResponse(true, 'OTP sent successfully', data);
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() dto: PhoneVerifyDto) {
    const data = await this.authService.verifyOtp(dto.country_code, dto.phone, dto.otp);
    return new ApiResponse(true, 'OTP verified successfully', data);
  }

  @Public()
  @Post('social-login')
  async socialLogin(@Body() dto: SocialLoginDto) {
    const data = await this.authService.socialLogin(dto);
    return new ApiResponse(true, 'Social login successful', data);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: { email: string }) {
    const data = await this.authService.forgotPassword(dto.email);
    return new ApiResponse(true, 'Password reset instructions sent', data);
  }

  @Post('onboarding-profile')
  async onboardingProfile(@CurrentUser('userId') userId: string, @Body() dto: OnboardingProfileDto) {
    const data = await this.authService.onboardingProfile(userId, dto);
    return new ApiResponse(true, 'Onboarding profile saved successfully', data);
  }

  @Post('logout')
  async logout(@Body('userId') userId: string) {
    return this.authService.logout(userId);
  }
}
