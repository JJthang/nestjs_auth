import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/common/dtos/user/user.dto';
import { UserEntity } from 'src/database';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existngUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    console.log('existngUser : ', existngUser);

    if (existngUser) {
      throw new NotFoundException('Email already exists');
    }
    const result = this.userRepository.create(createUserDto);
    const saveValue = await this.userRepository.save(result);

    if (!saveValue) {
      throw new NotFoundException('Create account error');
    }
    return result;
  }

  findAll() {
    return {
      message: 'Get all user successfully',
      data: 'This action returns all users',
    };
  }

  findOne(id: number) {
    return `This action returns a #id user`;
  }

  update(id: number, updateUserDto) {
    return `This action updates a #id user`;
  }

  remove(id: number) {
    return `This action removes a #id user`;
  }
}
