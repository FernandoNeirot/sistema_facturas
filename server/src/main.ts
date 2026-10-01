import 'dotenv/config';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  const frontendOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  // `credentials: true` es necesario para que el navegador mande/reciba la
  // cookie httpOnly de sesión (`access_token`) en requests cross-origin
  // (frontend en :3000, API en :4000).
  app.enableCors({ origin: frontendOrigin, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

void bootstrap();
