import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class PaginationPipe implements PipeTransform {
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    // Nếu không có metatype hoặc là kiểu primitive, bỏ qua transformation
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Chỉ gọi plainToInstance khi metatype là class hợp lệ
    const obj = plainToInstance(metatype, value);
    const errors = await validate(obj);
    if (errors.length > 0) {
      throw new BadRequestException('Invalid pagination query');
    }
    return obj;
  }
}
