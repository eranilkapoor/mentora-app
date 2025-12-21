import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpService {
  private otpStore = new Map<string, string>();

  async generate(phone: string) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
    this.otpStore.set(phone, otp);
    console.log(`OTP for ${phone}: ${otp}`); // For testing
    return otp;
  }

  async verify(phone: string, otp: string) {
    const validOtp = this.otpStore.get(phone);
    return validOtp === otp;
  }
}
