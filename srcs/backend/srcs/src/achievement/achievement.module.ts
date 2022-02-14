import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementService } from './achievement.service';
import { AchievementEntity } from './entities/achievement.entity';
import { AchievementController } from './achievement.controller';
import { UsersModule } from 'src/users/users.module';
import { MemberModule } from 'src/channel/member/member.module';

@Module({
  imports: [TypeOrmModule.forFeature([AchievementEntity]), forwardRef(() => UsersModule)],
  providers: [AchievementService],
  controllers: [AchievementController],
  exports: [AchievementService]
})
export class AchievementModule {}
