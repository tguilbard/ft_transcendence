import { forwardRef, Module } from '@nestjs/common';
import { GameHistoryService } from './game-history.service';
import { GameHistoryController } from './game-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from './entities/game-history.entity';
import { UsersModule } from 'src/users/users.module';
import { AchievementModule } from 'src/achievement/achievement.module';
import { UserEntity } from 'src/users/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MatchEntity]), TypeOrmModule.forFeature([UserEntity]), forwardRef(() => UsersModule), AchievementModule],
  providers: [GameHistoryService],
  exports: [GameHistoryService],
  controllers: [GameHistoryController]
})
export class GameHistoryModule {}