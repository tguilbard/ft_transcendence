import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageClass {
      public username: string;
      public message: string;
      public time: string;
      public colored: boolean;
}