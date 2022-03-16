import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service'
import { ChannelEntity } from './entities/channel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModeService } from './generics/mode.class';
import { QueryBuilderService } from 'src/generics/class/query-builder.service';
import { MemberEntity } from './entities/member.entity';
import { MessageEntity } from './entities/message.entity';
import { SqlFunctionService } from './utils/services/sql-function.service';
import { ChannelController } from './controllers/channel.controller';
import { UsersModule } from 'src/users/users.module';
import { MemberController } from './controllers/member.controller';
import { MessageController } from './controllers/message.controller';
@Module({
  imports: [TypeOrmModule.forFeature([ChannelEntity]), TypeOrmModule.forFeature([MemberEntity]), TypeOrmModule.forFeature([MessageEntity]),
  			forwardRef(() => UsersModule)],
  providers: [ChatService, ModeService, QueryBuilderService, SqlFunctionService],
  controllers: [ChannelController, MemberController, MessageController],
  exports: [ChatService, ModeService]
})
export class ChatModule {}
