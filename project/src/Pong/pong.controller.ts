/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Header, Param, StreamableFile } from '@nestjs/common';
import { PongService } from './pong.service';

@Controller('Pong')
export class PongController {
  constructor(private readonly PongService: PongService) {}

  @Get('Pong.js')
  getPong(): StreamableFile {
    return this.PongService.getFile("src/Pong/Pong.js");
  }

  @Get('PrivatePong.js')
  getPrivatePong(): StreamableFile {
    return this.PongService.getFile("src/Pong/PrivatePong.js");
  }

  @Get(':png')
  getAsset(@Param('png') path: string): StreamableFile {
    return this.PongService.getFile("src/Pong/assets/" + path);
  }

  @Get()
  getHello(): string {
    return this.PongService.getPage();
  }
}