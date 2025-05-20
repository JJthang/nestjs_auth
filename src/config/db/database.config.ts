import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlogEntity, CommentEntity, TagEntity, UserEntity } from 'src/database';

export const typeOrmConfigAsync: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    autoLoadEntities: true,
    entities: [UserEntity, BlogEntity, CommentEntity, TagEntity],
    synchronize: true,
  }),
  // __dirname + '/**/*.entity{.ts,.js}',
  inject: [ConfigService],
};
