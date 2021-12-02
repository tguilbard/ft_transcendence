import { StreamableFile } from '@nestjs/common';
export declare class PongService {
    constructor();
    page: string;
    getFile(path: string): StreamableFile;
    getPage(): string;
}
