import { Express } from 'express'

declare global{
    namespace Express {
        interface Request {
            User: any
			sessionID: any
        }
    }
}