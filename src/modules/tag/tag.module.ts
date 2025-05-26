import { Module } from '@nestjs/common';
import { TagController } from './controllers/tag.controller';
import { TagService } from './service/tag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from '@/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity])],
  controllers: [TagController],
  providers: [TagService],
  exports: [],
})
export class TagModule {}
