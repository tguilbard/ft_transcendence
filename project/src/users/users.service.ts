import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './entitys/users.entity';
import DatabaseFilesService from '../Photo/databaseFiles.service';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto'
import * as jwt from 'jsonwebtoken'


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private usersRepository: Repository<UsersEntity>,
    private readonly databaseFilesService: DatabaseFilesService,
    private readonly httpService: HttpService, private readonly jwt: JwtService
  ) { }

  async addAvatar(imageBuffer: Buffer, filename: string) {
    console.log(imageBuffer);
    const avatar = await this.databaseFilesService.uploadDatabaseFile(imageBuffer, filename);
    console.log('ID = ', avatar.id);
    await this.usersRepository.update(5, {
      avatarId: avatar.id
    });
    return avatar;
  }

  async register(body, response) {
    console.log('je suis dans register');

    console.log(body);
    //console.log(request);

    response.redirect('http://localhost:8080/login');
  }

  async isLogin(response) {
    console.log('je suis dans islogin 2');

    if (response.State && response.User)
      return response.send({ log: true });
    return response.send({ log: false });
  }


  async getAvatar() {
    const avatar = await this.databaseFilesService.getFileById(90)
    return avatar;
  }

  async isRegister(username) {
    console.log('je suis dans isRegister')
    return true;
  }

  async login(response, request) {
    if (!response.State) {
      console.log("je suis dans login");
      const code = request.body['code'];
      const url = 'https://api.intra.42.fr/oauth/token';
      const postData = {
        grant_type: 'authorization_code',
        client_id: '61094fffbf3140a13c461779c220cbc96dfbad643921a60e345ff8a99928a7a2',
        client_secret: 'ca81f062eb8d1c29f73449afed67fd1b2e462cdf0899e89953d740086fa4186d',
        redirect_uri: 'http://localhost:8080/ok',
        code: code
      }
      var result;
      try {
        result = await lastValueFrom(this.httpService.post(url, postData).pipe(map(resp => resp.data)));
        console.log('access_token de 42 in login = ', result.access_token);
      }
      catch (e) {
        console.log("problem avec le token de 42");
      }
      try {
        /* On récupère le nom d'utilisateur dans la requête */
        const url = 'https://api.intra.42.fr/v2/me';

        const postData = {
          'Authorization': 'Bearer ' + result.access_token
        }


        var info = await lastValueFrom(this.httpService.get(url, { headers: postData }).pipe(map(resp => resp.data)));
        var username = info.login;

        /* On envoie une erreur au client si le paramètre username est manquant */
        if (!username) {
          return response.status(401).json({ message: 'missing_required_parameter', info: 'username' });
        }

        const xsrfToken = await crypto.randomBytes(64).toString('hex');

        /* On créer le JWT avec le token CSRF dans le payload */
        var state = false;
        if (await this.isRegister(username))
          state = true;
        console.log('state = ', state);
        console.log('login = ', username);
        const accessToken = await jwt.sign(
          { login: username, 'id': request.sessionID, state: state },
          'secret',
          {
            algorithm: "HS256"
            // audience: config.accessToken.audience,
            //expiresIn: config.accessToken.expiresIn / 1000, // Le délai avant expiration exprimé en seconde
            //issuer: config.accessToken.issuer,
          }
        );
        response.cookie('access_token', accessToken, {
          httpOnly: true,
          secure: true
        });
        console.log('cookie was set');

        response.json({
          //   accessTokenExpiresIn: config.accessToken.expiresIn,
          //   refreshTokenExpiresIn: config.refreshToken.expiresIn,
          'src': info.image_url,
          'username': username,
          'state': state,
        });
      }
      catch (err) {
        return response.status(500).json({ message: 'Internal server error' });
      }
    }
  }
}
