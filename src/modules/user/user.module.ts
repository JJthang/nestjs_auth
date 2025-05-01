import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/database';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [],
})
export class UserModule {}
