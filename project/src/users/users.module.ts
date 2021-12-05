import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import DatabaseFilesService from '../Photo/databaseFiles.service'
import { UsersEntity } from './entitys/users.entity';
import {TypeOrmModule} from '@nestjs/typeorm'
import DatabaseFile from '../Photo/databaseFile.entity';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity, DatabaseFile]),
  HttpModule,
  JwtModule.register({
    secret: 'secret',
    signOptions: { expiresIn: '60s' },
  })],
  controllers: [UsersController],
  providers: [UsersService, DatabaseFilesService, UsersEntity],
  exports: [TypeOrmModule]
})
export class UsersModule {}
