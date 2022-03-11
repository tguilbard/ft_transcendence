import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { UsersService } from './users/users.service'
import { GlobalExceptionFilter } from './auth/filter/GlobalExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const usersService = app.get(UsersService);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  
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
  
  await usersService.InitStateUsersInDB();
  await app.listen(configService.get('PORT'));

  global.init = true;
  global.socketUserList = [];
  global.server = '';
}
bootstrap();
