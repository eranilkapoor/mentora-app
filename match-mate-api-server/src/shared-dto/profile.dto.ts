import { 
  IsString, 
  IsNumber, 
  IsArray, 
  IsOptional 
} from 'class-validator';

export class CreateProfileDto {
  @IsString() userId: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsNumber() age?: number;
  @IsOptional() @IsString() religion?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsArray() interests?: string[];
}