import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

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

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on ${await app.getUrl()}`);
  console.log(`Swagger documentation at ${await app.getUrl()}/api`);
}
bootstrap();
