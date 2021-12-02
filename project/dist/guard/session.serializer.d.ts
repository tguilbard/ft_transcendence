import { PassportSerializer } from '@nestjs/passport';
export declare class SessionSerializer extends PassportSerializer {
    constructor();
    serializeUser(user: any, done: (err: Error, user: any) => void): void;
    deserializeUser(user: any, done: (err: Error, user: any) => void): Promise<void>;
}
