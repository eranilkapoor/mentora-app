import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class PhoneSendOtpDto {
  @IsNotEmpty()
  country_code!: string;

  @IsNotEmpty()
  @Matches(/^[0-9]{8,15}$/, {
    message: 'Invalid phone number',
  })
  phone!: string;
}

export class PhoneVerifyDto {
  @IsNotEmpty()
  country_code!: string;

  @IsNotEmpty()
  @Matches(/^[0-9]{8,15}$/, {
    message: 'Invalid phone number',
  })
  phone!: string;

  @IsNotEmpty()
  @Length(6)
  otp!: string;

  @IsOptional()
  @Matches(/^[a-zA-Z0-9]{6,10}$/, {
    message: 'Invalid referral code',
  })
  referralCode?: string;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  campaign?: string;
}
