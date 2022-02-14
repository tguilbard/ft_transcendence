import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { ChannelModule } from '../channel.module';
import { MemberController } from './member.controller';
import { MemberEntity } from './entities/member.entity';
import { MemberService } from './member.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemberEntity]), forwardRef(() => UsersModule), forwardRef(() => ChannelModule)],
  providers: [MemberService],
  controllers: [MemberController],
  exports: [MemberService]
})
export class MemberModule {}
