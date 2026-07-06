import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Ritam API running on http://localhost:${port}`);
}
bootstrap();
