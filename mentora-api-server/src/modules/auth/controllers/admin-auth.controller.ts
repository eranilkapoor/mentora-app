import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { RateLimit } from '@/common/decorators/rate-limit.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { SuccessCode } from '@/common/constants';
import { AppRequest } from '@/common/interfaces/app-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { LoginDto } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @RateLimit({
    name: 'admin-auth-login',
    ttl: 900,
    limit: 10,
    message: 'Too many admin login attempts. Try again later.',
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
}
