require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from "@nestjs/platform-express";
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
    cors: {
      credentials: true,
      origin: true,
      exposedHeaders: ['x-sess-id', 'set-cookie'],
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    },
  });

  app.use(compression());
  app.use(cookieParser());
  await app.listen(process.env.PORT || 3000);
  console.log(`App is running on port ${process.env.PORT}`)
}


bootstrap();
