import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { type } from 'os';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true, //any .env file
      //cache: true //More fastest
   }),
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        inject: [ConfigService],
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        autoLoadEntities: true,
        entities: ["dist/**/*.entity{.ts,.js}"],
        synchronize: true
      }),
      inject: [ConfigService]
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
