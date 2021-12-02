import { PongService } from './pong.service';
import { PongController } from './pong.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [
        PongController,],
    providers: [
        PongService,],
})
export class PongModule { }
