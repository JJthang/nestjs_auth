import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/errors/ErrorHttpStatus';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new SuccessResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transformOptions: { enableImplicitConversion: true },
      dismissDefaultMessages: false,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
