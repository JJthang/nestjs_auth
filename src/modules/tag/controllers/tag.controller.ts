import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CreateTagDto } from '@/shared/dtos/tag/tag.dto';
import { TagService } from '../service/tag.service';
import { idParamsString } from '@/shared/dtos/user/user.dto';
// import { PaginationInterceptor } from 'src/common/interceptors/pagination.interceptor';
import { PaginationPipe } from '@/shared/pipes/common/pagination.pipe';
import { PageOptionsDto } from '@/shared/dtos/common/pagination.dto';

@Controller('tags')
@UseInterceptors(ClassSerializerInterceptor)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post('create-tag')
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.createTag(createTagDto);
  }

  @Get('')
  findAll(@Query(new PaginationPipe()) pagination: PageOptionsDto) {
    return this.tagService.getTags(pagination);
  }

  @Get(':id')
  findOne(@Param() params: idParamsString) {
    return this.tagService.findOne(params.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id);
  }
}
