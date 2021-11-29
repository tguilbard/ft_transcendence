import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports:[TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
