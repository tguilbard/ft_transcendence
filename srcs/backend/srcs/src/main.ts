import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {
//  const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);

  app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
  }));

  app.use(cookieParser());
  
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  console.log(process.env.DATABASE_TYPE);
  await app.listen(configService.get('PORT'));
}
bootstrap();
