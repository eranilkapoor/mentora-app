import { IsNotEmpty, Matches } from 'class-validator';

export class PhoneSignupDto {
  @IsNotEmpty()
  countryCode: string;

  @Matches(/^[0-9]{8,15}$/, {
    message: 'Invalid phone number',
  })
  phone: string;
}
