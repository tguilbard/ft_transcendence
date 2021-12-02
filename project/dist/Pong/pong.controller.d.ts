import { StreamableFile } from '@nestjs/common';
import { PongService } from './pong.service';
export declare class PongController {
    private readonly PongService;
    constructor(PongService: PongService);
    getPong(): StreamableFile;
    getPrivatePong(): StreamableFile;
    getAsset(path: string): StreamableFile;
    getHello(): string;
}
