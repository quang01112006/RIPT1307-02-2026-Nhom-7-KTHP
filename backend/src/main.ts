import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Cấu hình cho swagger
  const config = new DocumentBuilder()
    .setTitle('Diễn đàn hỏi đáp sinh viên')
    .setDescription('Danh sách API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Tự động bọc { data } cho mọi API response để khớp với useInitModel của Frontend
  app.useGlobalInterceptors(new TransformInterceptor());

  // Bật ValidationPipe để chặn request gửi sai định dạng (thiếu @ ở email, vv)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các thuộc tính không có trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu có thuộc tính thừa
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on ${await app.getUrl()}`);
  console.log(`Swagger documentation at ${await app.getUrl()}/api`);
}
bootstrap();
