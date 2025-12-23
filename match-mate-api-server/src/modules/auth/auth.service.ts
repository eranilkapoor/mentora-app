import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './user.repository';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto, PhoneSendOtpDto, PhoneVerifyDto } from '../../shared-dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.userRepo.create({ ...dto, password_hash: hashedPassword });
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (user?.password_hash && (await bcrypt.compare(password, user.password_hash))) return user;
    return null;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user);
  }

  // ---------------- PHONE LOGIN FLOW ----------------
  async sendOtp(phone: string) {
    const otp = await this.otpService.generate(phone);
    return { phone, message: 'OTP sent successfully', otp }; // OTP for testing
  }

  async verifyOtp(phone: string, otp: string) {
    const isValid = await this.otpService.verify(phone, otp);
    if (!isValid) throw new UnauthorizedException('Invalid OTP');

    let user = await this.userRepo.findByPhone(phone);
    if (!user) user = await this.userRepo.create({ phone, provider: 'phone' });

    return this.issueTokens(user);
  }

  // ---------------- SOCIAL LOGIN ----------------
  async validateOAuthLogin(provider: string, profile: any) {
    let user = await this.userRepo.findByProvider(provider, profile.id);
    if (!user)
      user = await this.userRepo.create({
        provider,
        providerId: profile.id,
        email: profile.email,
        first_name: profile.first_name,
      });
    return this.issueTokens(user);
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.userRepo.findById(userId);
    if (!user || !(user as any).refresh_token) throw new UnauthorizedException('Access denied');
    const isValid = await bcrypt.compare(refreshToken, (user as any).refresh_token);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');
    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.userRepo.updateRefreshToken(userId, null);
    return true;
  }

  private async issueTokens(user: any) {
    const tokens = await this.generateTokens(user._id.toString(), user.email ?? '');
    const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10);
    await this.userRepo.updateRefreshToken(user._id.toString(), hashedRefresh);
    return { userId: user._id, ...tokens };
  }
}
