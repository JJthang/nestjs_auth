import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PageDto,
  PageMetaDto,
  PageOptionsDto,
} from 'src/common/dtos/common/pagination.dto';
import { CreateTagDto } from 'src/common/dtos/tag/tag.dto';
import { TagEntity } from 'src/database';
import { Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagEntity: Repository<TagEntity>,
  ) {}

  async createTag(body: CreateTagDto) {
    const tagResult = await this.tagEntity.findOne({
      where: {
        name: body.name,
      },
    });
    if (tagResult) {
      throw new ConflictException('This tag already exists');
    }
    const newTagResult = await this.tagEntity.save(this.tagEntity.create(body));
    return {
      message: 'Tag created successfully',
      data: newTagResult,
    };
  }

  async getTags(pageOptionsDto: PageOptionsDto) {
    // const getTags = await this.tagEntity.find();
    const queryBuilder = this.tagEntity.createQueryBuilder('tags');

    queryBuilder
      .orderBy('tags.created_at', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    const result = new PageDto(entities, pageMetaDto);
    return {
      message: 'Tags retrieved successfully',
      data: {
        result: result.data,
        ...result.meta,
      },
    };
  }

  async findOne(id: string) {
    const tag = await this.tagEntity.findOne({
      where: {
        id: id,
      },
    });

    return {
      message: 'Tag retrieved successfully',
      data: tag,
    };
  }

  remove(id: number) {
    return `This action removes a #id tag`;
  }
}
