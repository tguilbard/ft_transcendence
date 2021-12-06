import { Controller, Post, Res, Response, Body, Req, UnauthorizedException } from '@nestjs/common';
import { TfaService } from './tfa.service';
import { GenerateTfaDTO } from './dto/Generate-tfa.dto';
import { TfaCodeDTO } from './dto/Tfa-code.dto';
import { UserEntity } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';

@Controller('2fa')
export class TfaController {
    constructor(
        private readonly tfaService: TfaService,
        private readonly usersService : UsersService
    ){}

    @Post('generate')
    async GenerateTfa(@Res() response: Response)
    {
        const generateTfaForUser = {login:'jelarose', 'id':1};
        //console.log(`test : ${generateTfaForUser}`);
        const { otpauthURL } = await this.tfaService.GenerateTfa(generateTfaForUser);
        return this.tfaService.PipeQrCodeStream(response, otpauthURL);
    }

    @Post('activate')
    async ActivateTfa(@Body() tfaCodeDTO : TfaCodeDTO)
    {
        const user = await this.usersService.FindUserById(1);
        if (!this.tfaService.IsTfaCodeValid(tfaCodeDTO.code, user.tfaSecret))
        {
            throw new UnauthorizedException('Wrong authentification Code');
        }
        else
        {
            console.log('code valide');
            //this.usersService.UpdateUser(tfaCodeDTO.id, { "tfaSecret": user.tfaSecret });
            await this.usersService.ActivateTfa(1);
        }
    }
}
