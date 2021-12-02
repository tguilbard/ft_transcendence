import { Injectable, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class PongService {
  constructor() {
    fs.readFile(join(process.cwd(), "src/Pong/Pong.html"), (err, data) => {
      if (err) throw err;
        this.page = data.toString();
    });
  }

  page : string;

  getFile(path : string): StreamableFile {
    const file = createReadStream(join(process.cwd(), path));
    return new StreamableFile(file);
  }


  getPage(): string {
    fs.readFile(join(process.cwd(), "src/Pong/Pong.html"), (err, data) => {
      if (err) throw err;
        this.page = data.toString();
    });
    return this.page;
  }
}
