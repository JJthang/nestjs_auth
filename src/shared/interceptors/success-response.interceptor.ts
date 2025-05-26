import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
export interface IResponse<T> {
  status?: number;
  message?: string;
  data?: T;
}

@Injectable()
export class SuccessResponseInterceptor<T>
  implements NestInterceptor<T, IResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((data: T) => {
        return {
          status: context.switchToHttp().getResponse<Response>().statusCode,
          message: (data as { message: string })?.message || '',
          data: (data as any).data,
        };
      }),
    );
  }
}
