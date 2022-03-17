import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TfaModule } from 'src/auth/tfa/tfa.module';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AvatarModule } from './avatar/avatar.module';
import DatabaseFilesService from './avatar/avatar.service';
import DatabaseFile from './avatar/entities/avatar.entity'
import { QueryBuilderService } from 'src/generics/class/query-builder.service';
import { AchievementModule } from 'src/achievement/achievement.module';
import { ChatModule } from 'src/chat/chat.module';


@Module({
  imports:[TypeOrmModule.forFeature([UserEntity]), forwardRef(() => TfaModule), forwardRef(() => ChatModule),
  TypeOrmModule.forFeature([DatabaseFile]),
  HttpModule,
  AchievementModule,
  JwtModule.register({
    secret: process.env.SESSION_SECRET,
    signOptions: { expiresIn: '60s' },
  }),
  AvatarModule],
  controllers: [UsersController],
  providers: [UsersService, DatabaseFilesService,  QueryBuilderService],
  exports: [UsersService]
})
export class UsersModule {}
