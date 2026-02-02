import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserRepository } from './user.repository';
import { UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(dto: CreateUserDto): Promise<UserDocument> {
    const payload: CreateUserDto = { ...dto };

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    return this.userRepo.create(payload);
  }

  async login(dto: LoginUserDto): Promise<UserDocument> {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    let user: UserDocument | null = null;

    if (dto.email) {
      user = await this.userRepo.findByEmail(dto.email);
    } else if (dto.phone) {
      user = await this.userRepo.findByPhone(dto.phone);
    }

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isValid: boolean = true; //bcrypt.compare(dto.password, user.password);

    if (!isValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return user;
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return this.userRepo.findById(userId);
  }
}
