import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path/posix';
import { Strategy} from 'passport-42';
import * as passport from 'passport';
import * as session from 'express-session';

import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //app.useStaticAssets(join(__dirname, '..', 'static'));

  app.use(cookieParser());
  // app.use(passport.initialize());
  // app.use(passport.session());

  // app.get('',
  //   passport.authenticate('42'));
  // app.use(function(req, res, next) {
  //   res.setHeader("Access-Control-Allow-Origin", '*');
  //   res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
  //   res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');
  
  //   next();
  // });
 //app.enableCors();
 app.enableCors({
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});

//   header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
// header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
  // app.use(
  //   session({
  //     secret: 'secret',
  //     resave: false,
  //     saveUninitialized: false,
  //   }),
  // );

  // app.use(passport.initialize());
  // app.use(passport.session());

  await app.listen(3000);
}

bootstrap();