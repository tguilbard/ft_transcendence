import { Module, forwardRef } from '@nestjs/common';
import { TfaService } from './tfa.service';
import { TfaController } from './tfa.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), forwardRef(() => UsersModule)],
  providers: [TfaService],
  controllers: [TfaController]
})
export class TfaModule {}