import { ArgumentsHost, BadRequestException, UnauthorizedException, Catch, ExceptionFilter, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError, CannotCreateEntityIdMapError } from 'typeorm';
import { GlobalResponseError } from './GlobalResponseError';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        let message = (exception as any).message.message;
        let code = 'HttpException';
        
       // Logger.error(message, (exception as any).stack, `${request.method} ${request.url}`);
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        
        switch (exception.constructor) {
            case HttpException:
                status = (exception as HttpException).getStatus();
                break;
            case QueryFailedError:  // this is a TypeOrm error
                let errorMsg = (exception as QueryFailedError).driverError.detail;
                let item = errorMsg.substring(errorMsg.indexOf('(') + 1, errorMsg.indexOf(')'));
                message = [{[item] : errorMsg.replace('Key (', '').replace(')=(', ' ').replace(') ', ' ') }];
                code = (exception as any).code;
                break;
            case EntityNotFoundError:  // this is another TypeOrm error
                status = HttpStatus.UNPROCESSABLE_ENTITY
                message = (exception as EntityNotFoundError).message;
                code = (exception as any).code;
                break;
            case CannotCreateEntityIdMapError: // and another
                status = HttpStatus.UNPROCESSABLE_ENTITY
                message = (exception as CannotCreateEntityIdMapError).message;
                code = (exception as any).code;
                break;
            case BadRequestException:
                status = HttpStatus.UNPROCESSABLE_ENTITY
                message = (exception as BadRequestException);
                message = message.response.message;
                let tab = [];
                for (let pas = 0; pas < message.length; pas++) {
                    let item2 = message[pas].substring(0, message[pas].indexOf(' '));
                    tab.push({[item2] : message[pas]});
                  }
               message = tab;
                code = (exception as any).code;
                break;
            case UnauthorizedException: // and another
                status = (exception as UnauthorizedException).getStatus();
                message = (exception as UnauthorizedException).message;
                break;
            case NotFoundException: // and another
            status = (exception as NotFoundException).getStatus();
            message = (exception as NotFoundException).message;
            break;
            default:
                status = HttpStatus.INTERNAL_SERVER_ERROR
        }
        response.status(status).json(GlobalResponseError(status, message, code, request));
    }
}