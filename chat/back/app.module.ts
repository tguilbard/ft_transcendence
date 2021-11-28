import { Module } from '@nestjs/common';
//import { AppController } from './app.controller';
import { Chan, User } from './app.service';
import { AppGateway } from './app.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [Chan, User, AppGateway],
})
export class AppModule {}