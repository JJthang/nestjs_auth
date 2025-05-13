import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createUserDto as CreateUserDto,
  updateUserDto,
  userPaginationDto,
} from 'src/common/dtos/user/user.dto';
import { UserEntity } from 'src/database';
import { ILike, QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly defaultSelect: (keyof UserEntity)[] = [
    'id',
    'email',
    'firstName',
    'lastName',
    'avatar',
    'created_at',
    'updated_at',
  ] as const;
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async signUp(createUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create({
        ...createUserDto,
        password: await this.hashPassword(createUserDto.password),
      });
      return await this.userRepository.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException('Create account error');
    }
  }

  async getAllUser(query: userPaginationDto) {
    const { email = '', limit = 10, setOff = 0 } = query;
    const where = email ? { email: ILike(`%${email}%`) } : undefined;

    const [data, total] = await this.userRepository.findAndCount({
      where: where,
      skip: setOff,
      order: { created_at: 'DESC' },
      take: limit,
      select: this.defaultSelect,
    });
    return {
      message: 'Get all user successfully',
      data: {
        total,
        result: data,
      },
    };
  }

  async findOne(id: number) {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async getDetailUser(id: number) {
    const result = await this.userRepository.findOne({
      where: { id },
      select: this.defaultSelect,
    });
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'Get user successfully',
      data: result,
    };
  }

  async update(id: number, dataForm: updateUserDto) {
    if (dataForm.password) {
      dataForm.password = await this.hashPassword(dataForm.password);
    }

    const user = await this.userRepository.preload({ id, ...dataForm });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException('Update user error');
    }

    const userInfo = await this.userRepository.findOne({
      where: { id },
      select: this.defaultSelect,
    });

    return {
      message: 'Update info user successfully',
      data: userInfo,
    };
  }

  async remove(id: number) {
    const result = await this.userRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'Delete user successfully',
    };
  }
}
