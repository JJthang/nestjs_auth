import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpMessage } from './ErrorMessage';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const error: string | { [key: string]: any } =
      exception instanceof HttpException
        ? exception.getResponse()
        : HttpMessage.INTERNAL_SERVER_ERROR;

    const errorMessage: string =
      typeof error === 'string'
        ? error
        : (error as { message: string }).message ||
          'An unexpected error occurred';

    response.status(status).json({
      status,
      message: errorMessage,
      method: request.method,
    });
  }
}

// export class ResponseData<T> {
//   data: T | T[];
//   statusCode?: number;
//   message?: string;

//   constructor(data: T | T[], statusCode?: number, message?: string) {
//     this.data = data;
//     this.statusCode = statusCode;
//     this.message = message;
//     return this;
//   }
// }
