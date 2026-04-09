import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './repositories/user.repository';
import { ProfileService } from '../profile/profile.service';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto, SocialLoginDto } from './dto/auth.dto';
import { AuthProvider } from './enums/auth-provider.enum';
import { OnboardingProfileDto } from './dto/onboarding-profile.dto';
import { StorageService } from '../storage/storage.service';
import type { ICacheService } from 'src/modules/cache/cache.interface';
import { CACHE_SERVICE } from 'src/modules/cache/cache.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly storageService: StorageService,
    private readonly userRepo: UserRepository,
    private readonly profileService: ProfileService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) { }

  async register(dto: RegisterDto) {
    try {
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
        userId: user._id,
        role: 'user',
      });

      const cacheKey = `auth:${user._id}`;
      // Cache for 15 minutes
      await this.cache.set(cacheKey, token, 900);

      return {
        user: {
          userId: user._id,
          email: user.primaryEmail,
          isEmailVerified: user.isEmailVerified,
          isProfileCompleted: user.isProfileCompleted,
        },
        token,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new UnauthorizedException('Registration failed');
    }
  }

  async login(dto: LoginDto) {
    try {
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
        userId: existingUser._id,
        role: 'user',
      });

      const cacheKey = `auth:${existingUser._id}`;
      // Cache for 15 minutes
      await this.cache.set(cacheKey, token, 900);

      return {
        user: {
          userId: existingUser._id,
          email: existingUser.primaryEmail,
          isEmailVerified: existingUser.isEmailVerified,
          isProfileCompleted: existingUser.isProfileCompleted,
        },
        token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  sendOtp(country_code: string, phone: string) {
    const otp = this.otpService.generate(country_code, phone);
    return { phone, otp };
  }

  async verifyOtp(country_code: string, phone: string, otp: string) {
    try {
      const isValid = this.otpService.verify(country_code, phone, otp);
      if (!isValid) throw new UnauthorizedException('Invalid OTP');

      const existingUser = await this.userRepo.findByProvider(
        AuthProvider.PHONE,
        `${country_code}|${phone}`,
      );

      if (existingUser) {
        const token = this.jwtService.sign({
          userId: existingUser._id,
          role: 'user',
        });

        const cacheKey = `auth:${existingUser._id}`;
        // Cache for 15 minutes
        await this.cache.set(cacheKey, token, 900);

        return {
          user: {
            userId: existingUser._id,
            phone: existingUser.primaryPhone,
            isPhoneVerified: existingUser.isPhoneVerified,
            isProfileCompleted: existingUser.isProfileCompleted,
          },
          token,
        };
      }

      const user = await this.userRepo.create({
        authAccounts: [
          {
            provider: AuthProvider.PHONE,
            providerId: `${country_code}|${phone}`,
            isVerified: true,
            isPrimary: true,
          },
        ],
      });

      user.primaryPhone = { countryCode: country_code, phone };
      await user.save();

      const token = this.jwtService.sign({
        userId: user._id,
        role: 'user',
      });

      const cacheKey = `auth:${user._id}`;
      // Cache for 15 minutes
      await this.cache.set(cacheKey, token, 900);

      return {
        user: {
          userId: user._id,
          phone: user.primaryPhone,
          isPhoneVerified: user.isPhoneVerified,
          isProfileCompleted: user.isProfileCompleted,
        },
        token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('OTP verification failed');
    }
  }

  async socialLogin(dto: SocialLoginDto) {
    try {
      const existingUser = await this.userRepo.findByProvider(
        AuthProvider[dto.provider.toUpperCase() as keyof typeof AuthProvider],
        dto.provider_id,
      );

      if (existingUser) {
        const token = this.jwtService.sign({
          userId: existingUser._id,
          role: 'user',
        });

        const cacheKey = `auth:${existingUser._id}`;
        // Cache for 15 minutes
        await this.cache.set(cacheKey, token, 900);

        return {
          user: {
            userId: existingUser._id,
            provider: dto.provider,
            isProfileCompleted: existingUser.isProfileCompleted,
          },
          token,
        };
      }

      const user = await this.userRepo.create({
        authAccounts: [
          {
            provider:
              AuthProvider[
              dto.provider.toUpperCase() as keyof typeof AuthProvider
              ],
            providerId: dto.provider_id,
            isVerified: true,
            isPrimary: true,
          },
        ],
      });

      const token = this.jwtService.sign({
        userId: user._id,
        role: 'user',
      });

      const cacheKey = `auth:${user._id}`;
      // Cache for 15 minutes
      await this.cache.set(cacheKey, token, 900);

      return {
        user: {
          userId: user._id,
          provider: dto.provider,
          isProfileCompleted: user.isProfileCompleted,
        },
        token,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new UnauthorizedException('Social login failed');
    }
  }

  async forgotPassword(email: string) {
    try {
      const normalizedEmail = email.toLowerCase();

      const user = await this.userRepo.findByProvider(
        AuthProvider.EMAIL,
        normalizedEmail,
      );

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const resetToken = this.jwtService.sign(
        { userId: user._id, type: 'password-reset' },
        { expiresIn: '15m' },
      );

      // TODO: Send reset token via email (e.g., using MailerService)
      return { message: 'Password reset link sent to email', resetToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        'Failed to process password reset request',
      );
    }
  }

  async onboardingProfile(userId: string, dto: OnboardingProfileDto, images: Express.Multer.File[]) {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Parse primaryImageIndex sent from frontend FormData
      const primaryIndex = dto.primaryImageIndex !== undefined
        ? parseInt(String(dto.primaryImageIndex), 10)
        : 0;

      // Upload images to local filesystem
      const uploadedImages = await this.uploadImages(images, primaryIndex);

      await this.profileService.createProfile(userId, dto, uploadedImages);

      user.isProfileCompleted = true;
      await user.save();

      return {
        userId: user._id,
        isProfileCompleted: user.isProfileCompleted,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Profile onboarding failed');
    }
  }

  private async uploadImages(
    files: Express.Multer.File[],
    primaryIndex: number,
  ): Promise<{ filename: string; url: string; isPrimary: boolean }[]> {
    if (!files || files.length === 0) return [];

    const uploaded = await this.storageService.uploadFiles(files, 'profiles');

    return uploaded.map((result, index) => ({
      filename: result.filename, // ← just the filename, stored in DB
      url: result.url,           // ← full URL for client use
      isPrimary: index === primaryIndex,
    }));
  }

  async verifyUser(userId: string) {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        userId: user._id,
        email: user.primaryEmail,
        phone: user.primaryPhone,
        isProfileCompleted: user.isProfileCompleted,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('User verification failed');
    }
  }

  logout() {
    // Invalidate user session or token (depends on your implementation)
    // If using token blacklisting, add token to blacklist
    // If using session storage, clear the session
    // For now, returning true indicates successful logout
    return true;
  }
}
