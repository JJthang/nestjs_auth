import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/errors/ErrorHttpStatus';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // Đăng ký Exception Filter toàn cục để catch mọi lỗi HTTP không bắt tay trong code
  app.useGlobalFilters(new HttpExceptionFilter());
  // Đăng ký Interceptor toàn cục để wrap response thành chuẩn chung
  app.useGlobalInterceptors(new SuccessResponseInterceptor());
  // Đăng ký ValidationPipe toàn cục để validate và transform payload incoming
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // Tự động chuyển kiểu dữ liệu (string → number, dto instance…)
      transform: true,
      // Trả lỗi khi có thuộc tính không mong muốn thay vì silent strip
      forbidNonWhitelisted: true,
      // Sử dụng HTTP status 422 Unprocessable Entity cho lỗi validation
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      // Cho phép implicit conversion dựa trên kiểu trong DTO
      transformOptions: { enableImplicitConversion: true },
      // Giữ lại thông báo lỗi mặc định (nếu không custom)
      dismissDefaultMessages: false,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
