import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { UsersModule } from 'src/users/users.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [forwardRef(() => UsersModule), HttpModule],
  providers: [AchievementService],
  controllers: [AchievementController],
  exports: [AchievementService]
})
export class AchievementModule {}
