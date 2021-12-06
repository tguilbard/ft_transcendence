import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TfaModule } from 'src/tfa/tfa.module';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import DatabaseFilesService from '../Photo/databaseFiles.service';
import DatabaseFile from '../Photo/databaseFile.entity';



@Module({
  imports:[TypeOrmModule.forFeature([UserEntity]), forwardRef(() => TfaModule),
  TypeOrmModule.forFeature([DatabaseFile]),
  HttpModule,
  JwtModule.register({
    secret: 'secret',
    signOptions: { expiresIn: '60s' },
  })],
  controllers: [UsersController],
  providers: [UsersService, DatabaseFilesService],
  exports: [UsersService]
})
export class UsersModule {}
