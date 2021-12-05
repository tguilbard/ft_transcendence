import { PongModule } from './Pong/pong.module';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware } from './middleware/resgister.middleware';
import { UsersService } from './users/users.service';
import DatabaseFilesService from './Photo/databaseFiles.service'
import { UsersEntity } from './users/entitys/users.entity';
import { UsersController } from './users/users.controller';


@Module({
  imports: [
    PongModule,
    UsersModule,
    HttpModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '60s' },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'jelarose',
      password: 'jelarose',
      database: 'pong',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true
  })],
  controllers: [
    AppController, UsersController],
  providers: [
    AppGateway, AppService, UsersService, DatabaseFilesService, UsersEntity],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('');
  }
}