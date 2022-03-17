import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { UsersService } from 'src/users/users.service';
import { GenerateTfaDTO } from 'src/auth/tfa/dto/Generate-tfa.dto';
import { Response } from 'express';

@Injectable()
export class TfaService {
    constructor (
        private readonly usersService: UsersService
    ){}

    public async GenerateTfa(user: GenerateTfaDTO)
    {
        const secret = authenticator.generateSecret()

        const otpauthURL = await authenticator.keyuri(user.login, "Ft_transcendence", secret);
        await this.usersService.SetTfaSecret(user.id, secret);
        //I would like replace by the previous line by -> await this.usersService.UpdateUser(user.id, ); 
        //but that doesnt work
        return {
            secret, //not sure of utility
            otpauthURL
        };
    }

    /*send QR code for Google authentificator which can be read by browser*/
    public async PipeQrCodeStream(stream: Response, otpauthURL: string)
    {
        return await toFileStream(stream, otpauthURL);
    }

    public IsTfaCodeValid(tfaCode: string, tfa: string)
    {
        return authenticator.verify({token: tfaCode, secret: tfa});
    }

    
}
