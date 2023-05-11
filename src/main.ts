import { ValidationPipe } from "@nestjs/common";

require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from "@nestjs/platform-express";
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

const MemoryStore = require('memorystore')(session)

declare module 'express-session' {
  export interface SessionData {
    id: string;
    lang: string;
    user: any;
  }
}

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
  const tokenExpiry  = (process.env.OAUTH_TOKEN_EXPIRY) ? parseInt(process.env.OAUTH_TOKEN_EXPIRY) : 60*60*23;

  app.use(compression());
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      store: new MemoryStore({
        checkPeriod: tokenExpiry // prune expired entries every 24h
      }),
      saveUninitialized: false,
      secret: 'keyboard cat',
      cookie: {
        secure: 'auto',
        path: '/',
        maxAge: null, //Needs to be in milliseconds
        httpOnly: false,
      },
      name: 'app.sess.id',
      resave: false,
    }),
  );
  await app.listen(process.env.PORT || 3000);
  console.log(`App is running on port ${process.env.PORT}`)
}


bootstrap();
