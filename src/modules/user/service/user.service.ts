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
import { FindOperator, ILike, QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async create(createUserDto: CreateUserDto) {
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
    const whereClause: Record<string, string | FindOperator<string>> = {};

    if (email) {
      whereClause.email = ILike(`%${email}%`);
    }

    const [data, total] = await this.userRepository.findAndCount({
      where: whereClause,
      skip: setOff,
      order: { created_at: 'DESC' },
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        created_at: true,
        updated_at: true,
        lastName: true,
        avatar: true,
      },
    });
    return {
      message: 'Get all user successfully',
      data: {
        total,
        result: data,
      },
    };
  }

  async getDetailUser(id: number) {
    const result = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        created_at: true,
        updated_at: true,
        lastName: true,
        avatar: true,
      },
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
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (dataForm?.password) {
      const salt = await bcrypt.genSalt();
      dataForm.password = await bcrypt.hash(dataForm.password, salt);
    }
    Object.assign(user, dataForm);
    await this.userRepository.save(user);
    const userInfo = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        created_at: true,
        updated_at: true,
        lastName: true,
        avatar: true,
      },
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
