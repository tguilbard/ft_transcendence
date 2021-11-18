import { Injectable, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';

@Injectable()
export class AppService {

  getHello(): string {
    return 'Hello World';
  }
}
