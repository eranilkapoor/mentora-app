import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './repositories/user.repository';
import { ProfileRepository } from '../profile/repositories/profile.repository';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto, SocialLoginDto } from './dto/auth.dto';
import { AuthProvider } from './enums/auth-provider.enum';
import { OnboardingProfileDto } from './dto/onboarding-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly profileRepo: ProfileRepository,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) { }

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
      userId: user._id,
      role: 'user',
    });

    return {
      user: {
        userId: user._id,
        email: user.primaryEmail,
        isEmailVerified: user.isEmailVerified,
        isProfileCompleted: user.isProfileCompleted,
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
      userId: existingUser._id,
      role: 'user',
    });

    return {
      user: {
        userId: existingUser._id,
        email: existingUser.primaryEmail,
        isEmailVerified: existingUser.isEmailVerified,
        isProfileCompleted: existingUser.isProfileCompleted,
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
      const token = this.jwtService.sign({
        userId: existingUser._id,
        role: 'user',
      });

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

    return {
      user: {
        userId: user._id,
        phone: user.primaryPhone,
        isPhoneVerified: user.isPhoneVerified,
        isProfileCompleted: user.isProfileCompleted,
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
      const token = this.jwtService.sign({
        userId: existingUser._id,
        role: 'user',
      });

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

    return {
      user: {
        userId: user._id,
        provider: dto.provider,
        isProfileCompleted: user.isProfileCompleted
      },
      token
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findByProvider(
      AuthProvider.EMAIL,
      email.toLowerCase(),
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const resetToken = this.jwtService.sign(
      { userId: user._id, type: 'password-reset' },
      { expiresIn: '15m' }
    );

    // TODO: Send reset token via email (e.g., using MailerService)
    return { message: 'Password reset link sent to email', resetToken };
  }

  async onboardingProfile(userId: string, dto: OnboardingProfileDto) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const profileData = {
      personal: {
        profileFor: dto.personal.profileFor,
        firstName: dto.personal.firstName,
        lastName: dto.personal.lastName,
        gender: dto.personal.gender,
        dob: dto.personal.dob,
        religion: dto.personal.religion,
        caste: dto.personal.caste,
        country: dto.personal.country,
        state: dto.personal.state,
        city: dto.personal.city,
        motherTongue: dto.personal.motherTongue,
        maritalStatus: dto.personal.maritalStatus,
        aboutMe: dto.personal.aboutMe,
      },
      physical: {
        height: dto.physical.height,
        weight: dto.physical.weight,
        bodyType: dto.physical.bodyType,
        complexion: dto.physical.complexion,
      },
      education: {
        qualification: dto.education.qualification,
        field: dto.education.field,
        university: dto.education.university,
        occupation: dto.education.occupation,
        annualIncome: dto.education.annualIncome,
      },
      family: {
        fatherName: dto.family.fatherName,
        motherName: dto.family.motherName,
        fatherOccupation: dto.family.fatherOccupation,
        motherOccupation: dto.family.motherOccupation,
        familyType: dto.family.familyType,
        familyStatus: dto.family.familyStatus,
        familyValues: dto.family.familyValues,
        siblings: dto.family.siblings,
      },
      preferences: {
        partnerPreference: dto.preferences.partnerPreference,
        hobbies: dto.preferences.hobbies,
        interests: dto.preferences.interests,
        music: dto.preferences.music,
        movies: dto.preferences.movies,
        sports: dto.preferences.sports,
        languagesKnown: dto.preferences.languagesKnown,
      }
    };

    await this.profileRepo.createProfile(userId, dto);

    user.isProfileCompleted = true;
    await user.save();

    return {
      userId: user._id,
      isProfileCompleted: user.isProfileCompleted,
    };
  }

  async logout(userId: string) {
    // Invalidate user session or token (depends on your implementation)
    // If using token blacklisting, add token to blacklist
    // If using session storage, clear the session
    // For now, returning true indicates successful logout
    return true;
  }
}
