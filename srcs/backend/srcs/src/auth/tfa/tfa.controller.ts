import { Controller, Post, Res, Body, Req, BadRequestException, Delete } from '@nestjs/common';
import { TfaService } from './tfa.service';
import { TfaCodeDTO } from './dto/Tfa-code.dto';
import { UsersService } from 'src/users/users.service';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken'
import { UpdateUserDTO } from 'src/users/dto/Update-user.dto';
import { UserEntity } from 'src/users/entities/users.entity';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';

@Controller('2fa')
export class TfaController {
    constructor(
        private readonly tfaService: TfaService,
        private readonly usersService: UsersService
    ) { }

    @Post('generate')
    async GenerateTfa(@Res() response: Response, @Req() req: Request) {
        const user = await this.usersService.FindUserByLogin(req.User.login);
        const generateTfaForUser = { login: user.login, id: user.id };
        const { otpauthURL } = await this.tfaService.GenerateTfa(generateTfaForUser);
        return this.tfaService.PipeQrCodeStream(response, otpauthURL);
    }

    @Post('activate')
    async ActivateTfa(@Body() tfaCodeDTO: TfaCodeDTO, @Req() req: Request, @Res() res: Response) {
        const user = await this.usersService.FindUserByLogin(req.User.login);
        if (!this.tfaService.IsTfaCodeValid(tfaCodeDTO.code, user.tfaSecret)) {
            throw new BadRequestException(["code invalide"]);
        }
        else {
            await this.usersService.ActivateTfa(user.id);
            const accessToken = await jwt.sign(
                { login: req.User.login, 'ses': req.sessionID, state: 'ok', id: user.id, username: req.User.username, guest: req.User.guest },
                'secret',
                {
                    algorithm: "HS256"
                }
            );
            res.status(204).cookie('access_token', accessToken, {
                httpOnly: true,
                secure: true
            });
            res.send(
                {
                    status: 'ok'
                }
            );
        }
    }

    @Delete()
	async Desactivate(
		@Body() updateUserDTO: UpdateUserDTO,
		@Req() req: Request): Promise<UpdateResult> {
		return await this.usersService.UpdateUser(req.User.id, updateUserDTO);
	}
}
