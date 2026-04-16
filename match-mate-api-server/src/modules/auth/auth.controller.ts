import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  UseInterceptors,
  UploadedFiles,
  ValidationPipe,
  BadRequestException,
  Req,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { ApiResponse } from 'src/common/dto/response.dto';
import {
  RegisterDto,
  LoginDto,
  PhoneSendOtpDto,
  PhoneVerifyDto,
  SocialLoginDto,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { OnboardingProfileDto } from './dto/onboarding-profile.dto';
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
    @Body() dto: RegisterDto
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
    @Body() dto: LoginDto
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
    @Body() dto: PhoneVerifyDto
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
    @Body() dto: SocialLoginDto
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
  @UseInterceptors(
    FilesInterceptor('profileImages', 6, {
      storage: memoryStorage(),
      fileFilter: (_, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowed.includes(file.mimetype)) {
          return cb(new Error('Only JPG, PNG, WEBP images are allowed'), false);
        }

        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
    }),
  )
  async onboardingProfile(
    @Req() req: AuthenticatedRequest,
    @CurrentUser('sub') userId: string,
    @Body(new ValidationPipe({ transform: true })) dto: OnboardingProfileDto,
    //@Body() dto: any,
    @UploadedFiles() profileImages: Express.Multer.File[],
  ) {
    console.log('🟢 AFTER VALIDATION DTO:', dto);
    const safeImages = profileImages ?? [];

    if (safeImages.length < 1) {
      throw new BadRequestException('At least 1 image is required');
    }

    try {
      const data = await this.authService.onboardingProfile(
        userId,
        dto,
        safeImages,
      );
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
    @Body('refreshToken') refreshToken?: string,
  ) {
    //const refreshToken = req.cookies?.refreshToken;

    return this.authService.refresh(req, res, refreshToken);
  }

  @Post('refresh')
  refreshMobile(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') refreshToken: string,
  ) {
    return this.authService.refresh(req, res, refreshToken);
  }

  @Post('logout')
  logout(@Req() req: AuthenticatedRequest, @Body('refreshToken') refreshToken: string) {
    try {
      return this.authService.logout(req.user.sub, refreshToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      return new ApiResponse(false, message);
    }
  }

  @Post('logout-all')
  logoutAll(@Req() req: AuthenticatedRequest) {
    return this.authService.logoutAll(req.user.sub);
  }
}
