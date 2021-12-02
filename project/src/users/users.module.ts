import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import DatabaseFilesService from '../Photo/databaseFiles.service'
import { UsersEntity } from './entitys/users.entity';
import {TypeOrmModule} from '@nestjs/typeorm'
import DatabaseFile from '../Photo/databaseFile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity, DatabaseFile])],
  controllers: [UsersController],
  providers: [UsersService, DatabaseFilesService, UsersEntity],
  exports: [TypeOrmModule]
})
export class UsersModule {}
