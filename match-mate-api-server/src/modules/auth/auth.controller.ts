import { Controller, Post, Body } from '@nestjs/common';
import { ApiResponse } from '../../common/response.dto';
import {
  RegisterDto,
  LoginDto,
  PhoneSendOtpDto,
  PhoneVerifyDto,
  SocialLoginDto,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
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

  @Post('logout')
  async logout(@Body('userId') userId: string) {
    return this.authService.logout(userId);
  }
}
