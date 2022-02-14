import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TfaModule } from 'src/auth/tfa/tfa.module';
import { UserEntity } from '../entities/users.entity';
import { UsersModule } from '../users.module';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.service';
import AvatarEntity from './entities/avatar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AvatarEntity]), forwardRef(() => UsersModule),
  TypeOrmModule.forFeature([UserEntity]), forwardRef(() => TfaModule)],
  controllers: [AvatarController],
  providers: [AvatarService]
})
export class AvatarModule {}
