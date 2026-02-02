import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './repositories/user.repository';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto, SocialLoginDto } from './dto/auth.dto';
import { AuthProvider } from './enums/auth-provider.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  private generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();

    const existingUser = await this.userRepo.findByProvider(
      AuthProvider.EMAIL,
      email,
    );

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepo.create({
      authAccounts: [
        {
          provider: AuthProvider.EMAIL,
          providerId: email,
          passwordHash,
          isVerified: false,
          isPrimary: true,
        },
      ],
    });

    user.primaryEmail = email;
    await user.save();

    const token = this.jwtService.sign({
      sub: user._id,
    });

    return {
      user: {
        userId: user._id,
        email: user.primaryEmail,
        isEmailVerified: user.isEmailVerified,
        profileCompleted: user.profileCompleted,
      },
      token,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();

    const existingUser = await this.userRepo.findByProvider(
      AuthProvider.EMAIL,
      email,
    );

    if (!existingUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (
      !existingUser.authAccounts[0].passwordHash ||
      !(await bcrypt.compare(
        dto.password,
        existingUser.authAccounts[0].passwordHash,
      ))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: existingUser._id,
    });

    return {
      user: {
        userId: existingUser._id,
        email: existingUser.primaryEmail,
        isEmailVerified: existingUser.isEmailVerified,
        profileCompleted: existingUser.profileCompleted,
      },
      token,
    };
  }

  async sendOtp(country_code: string, phone: string) {
    const otp = await this.otpService.generate(country_code, phone);
    return { phone, otp };
  }

  async verifyOtp(country_code: string, phone: string, otp: string) {
    const isValid = await this.otpService.verify(country_code, phone, otp);
    if (!isValid) throw new UnauthorizedException('Invalid OTP');

    const existingUser = await this.userRepo.findByProvider(
      AuthProvider.PHONE,
      `${country_code}|${phone}`,
    );

    if (existingUser) {
      return this.issueTokens(existingUser);
    }

    const user = await this.userRepo.create({
      authAccounts: [
        {
          provider: AuthProvider.PHONE,
          providerId: `${country_code}|${phone}`,
          isVerified: false,
          isPrimary: true,
        },
      ],
    });

    user.primaryPhone = { countryCode: country_code, phone };
    await user.save();

    const token = this.jwtService.sign({
      sub: user._id,
    });

    return {
      user: {
        userId: user._id,
        phone: user.primaryPhone,
        isPhoneVerified: user.isPhoneVerified,
        profileCompleted: user.profileCompleted,
      },
      token,
    };
  }

  async socialLogin(dto: SocialLoginDto) {
    const existingUser = await this.userRepo.findByProvider(
      AuthProvider[dto.provider.toUpperCase() as keyof typeof AuthProvider],
      dto.provider_id,
    );

    if (existingUser) {
      return this.issueTokens(existingUser);
    }

    const user = await this.userRepo.create({
      authAccounts: [
        {
          provider:
            AuthProvider[
              dto.provider.toUpperCase() as keyof typeof AuthProvider
            ],
          providerId: dto.provider_id,
          isVerified: false,
          isPrimary: true,
        },
      ],
    });

    const token = this.jwtService.sign({
      sub: user._id,
    });

    return {
      userId: user._id,
      provider: dto.provider,
      profileCompleted: user.profileCompleted,
      accessToken: token,
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.userRepo.findById(userId);
    if (!user || !(user as any).refresh_token)
      throw new UnauthorizedException('Access denied');
    const isValid = await bcrypt.compare(
      refreshToken,
      (user as any).refresh_token,
    );
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');
    return this.issueTokens(user);
  }

  async logout(userId: string) {
    return true;
  }

  private async issueTokens(user: any) {
    const tokens = await this.generateTokens(
      user._id.toString(),
      user.email ?? '',
    );
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10);

    return { userId: user._id, ...tokens };
  }
}
