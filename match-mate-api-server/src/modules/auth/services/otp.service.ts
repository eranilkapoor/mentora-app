import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpService {
  private otpStore = new Map<string, string>();

  generate(country_code: string, phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(`${country_code}|${phone}`, otp);

    return otp;
  }

  verify(country_code: string, phone: string, otp: string) {
    const validOtp = this.otpStore.get(`${country_code}|${phone}`);

    return validOtp === otp;
  }
}
