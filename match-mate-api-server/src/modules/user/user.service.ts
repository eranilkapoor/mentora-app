import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(dto: CreateUserDto) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    return this.userRepo.create(dto);
  }

  async login(dto: LoginUserDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    let user: any;

    if (dto.email) {
      user = await this.userRepo.findByEmail(dto.email);
    } else if (dto.phone) {
      user = await this.userRepo.findByPhone(dto.phone);
    }

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return user;
  }
}