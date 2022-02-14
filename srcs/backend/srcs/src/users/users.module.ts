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
import { MessageModule } from 'src/channel/message/message.module';
import { QueryBuilderService } from 'src/generics/class/query-builder.service';
import { ChannelModule } from 'src/channel/channel.module';
import { AchievementModule } from 'src/achievement/achievement.module';


@Module({
  imports:[TypeOrmModule.forFeature([UserEntity]), forwardRef(() => TfaModule), forwardRef(() => ChannelModule),
  TypeOrmModule.forFeature([DatabaseFile]),
  HttpModule,
  AchievementModule,
  JwtModule.register({
    secret: 'secret',
    signOptions: { expiresIn: '60s' },
  }),
  forwardRef(() => MessageModule),
  AvatarModule],
  controllers: [UsersController],
  providers: [UsersService, DatabaseFilesService,  QueryBuilderService],
  exports: [UsersService]
})
export class UsersModule {}
