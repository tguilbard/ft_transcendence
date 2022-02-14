import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementModule } from 'src/achievement/achievement.module';
import { AchievementService } from 'src/achievement/achievement.service';
import { QueryBuilderService } from 'src/generics/class/query-builder.service';
import { UsersModule } from 'src/users/users.module';
import { QueryBuilder } from 'typeorm';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';

import { ChannelEntity } from './entities/channel.entity';
import { ModeService } from './generics/mode.class';
import { MemberModule } from './member/member.module';
import { MessageModule } from './message/message.module';


@Module({
  imports: [TypeOrmModule.forFeature([ChannelEntity]), forwardRef(() => MemberModule),
  forwardRef(() => UsersModule), forwardRef(() => MessageModule)],
  providers: [ChannelService, ModeService, QueryBuilderService],
  controllers: [ChannelController],
  exports: [ChannelService, ModeService]
})
export class ChannelModule {}
