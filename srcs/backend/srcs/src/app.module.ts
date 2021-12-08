import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { TfaModule } from './tfa/tfa.module';

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UserEntity } from './users/entities/users.entity';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
// import DatabaseFilesService from './Photo/databaseFiles.service'
import { UsersController } from './users/users.controller';
import { AuthMiddleware } from './middleware/resgister.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true
   }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      entities: ["dist/**/*.entity{.ts,.js}"],
      synchronize: true,
  }),
    UsersModule,
    TfaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      //.apply(AuthMiddleware)
      //.forRoutes('');
  }
}
