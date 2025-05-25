import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const { page, limit } = req.query;
    return next.handle().pipe(
      map((result) => {
        console.log('test result: ', result);

        return {
          data: result[0],
          total: result[1],
          page: +page,
          limit: +limit,
        };
      }),
    );
  }
}
