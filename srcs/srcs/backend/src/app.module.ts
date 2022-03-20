import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { TfaModule } from './auth/tfa/tfa.module';
import { NestModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthMiddleware } from './auth/middleware/resgister.middleware';
import { QueryBuilderService } from './generics/class/query-builder.service';
import { ChatGateway } from './app.gateway';
import { AchievementModule } from './achievement/achievement.module';
import { GameHistoryModule } from './game-history/game-history.module';
import { PongGateway } from './pong.gateway';
import { ChatModule } from './chat/chat.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
	ServeStaticModule.forRoot({
		rootPath: join(__dirname, '..', 'app'),
	}),
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true, //any .env file
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
	AchievementModule,
    GameHistoryModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, QueryBuilderService, ChatGateway, PongGateway],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('/socket.io', '');
  }
}
