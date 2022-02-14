import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { ChannelModule } from '../channel.module';
import { MemberModule } from '../member/member.module';
import { MessageEntity } from './entitites/message.entity';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity]), forwardRef(() => UsersModule), forwardRef(() => ChannelModule), MemberModule],
  providers: [MessageService],
  controllers: [MessageController],
  exports: [MessageService]
})
export class MessageModule {}
