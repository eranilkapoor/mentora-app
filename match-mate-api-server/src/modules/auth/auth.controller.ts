import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, PhoneSendOtpDto, PhoneVerifyDto, SocialLoginDto } from '../../shared-dto/auth.dto';
import { ApiResponse } from '../../common/response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') 
  async register(@Body() dto: RegisterDto) { 
    const data = await this.authService.register(dto);
    return new ApiResponse(true, 'User registered successfully', data);
  }

  @Post('login') 
  async login(@Body() dto: LoginDto) { 
    const token = await this.authService.login(dto);
    return new ApiResponse(true, 'Login successful', { token });
  }

  // Phone OTP two-step login
  @Post('phone/send-otp') sendOtp(@Body() dto: PhoneSendOtpDto) { return this.authService.sendOtp(dto.phone); }
  @Post('phone/verify-otp') verifyOtp(@Body() dto: PhoneVerifyDto) { return this.authService.verifyOtp(dto.phone, dto.otp); }

  // Social login
  @Post('login/social') social(@Body() dto: SocialLoginDto) {
    return this.authService.validateOAuthLogin(dto.provider, { id: dto.accessToken, email: '', name: '' });
  }

  @Post('refresh') refresh(@Body('userId') userId: string, @Body('refreshToken') token: string) { return this.authService.refreshToken(userId, token); }
  @Post('logout') logout(@Body('userId') userId: string) { return this.authService.logout(userId); }
}
