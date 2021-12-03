import { Body, Controller, Get, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { lastValueFrom, Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto'
import * as jwt from 'jsonwebtoken'
import { map } from 'rxjs/operators';
import { url } from 'inspector';
import { UsersService } from './users/users.service';
import { blob } from 'stream/consumers';
import { writeFile } from 'fs/promises';
import fs from 'fs'


@Controller()
export class AppController {
  constructor (private readonly httpService: HttpService, private readonly jwt: JwtService,
	private readonly usersService: UsersService){}

  //@UseGuards(AuthenticatedGuard)
  
  @Get('salut')
   async salut(@Req() request: Request): Promise<any> {

	const { cookies, headers } = request;
	   await console.log('JE SUIS DANS SALUT');
      return await {'message': 'Hello World!',
					'cookie': cookies['access_token'],
					'token': headers['x-xsrf-token']
	};
  }

  //@UploadedFile() file

@Post('register')
async register(@Body() body: Body, @Res() response: Response)
{
	console.log('je suis dans register');

		console.log(body);
		//console.log(request);
		response.redirect('http://localhost:8080');
	}

	@Get('register')
	async isRegister(@Req() request: Request, @Res() response: Response)
	{
		//const { cookies } = request;
		console.log('user dans isregister', response.get('User'));
		response.redirect('http://localhost:8080/register');
	}

	// @Get()
	// async getAvatar(url: string, dest)
	// 	const response = await fetch(url);
	// 	const buffer = await response.buffer();
	// 	fs.writeFile(`./image.jpg`, buffer, () => 
	// 	  console.log('finished downloading!'));
	//   }

  @Post('login')
	async login(@Res() res: Response, @Req() request: Request)
	{
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
		console.log("je suis dans login 2");
		try{
			result = await lastValueFrom(this.httpService.post(url, postData).pipe(map(resp => resp.data)));
			console.log('access_token in login = ', result.access_token);
		}
		catch (e)
		{
			console.log("problem avec le post");

		}
		try
		{
			console.log('access_token in login = ', result.access_token);

			console.log("je suis dans login 3");

			/* On récupère le nom d'utilisateur dans la requête */
			const url = 'https://api.intra.42.fr/v2/me';
			const postData = { 
				'Authorization': 'Bearer ' + result.access_token
			}


			



			var info = await lastValueFrom(this.httpService.get(url, {headers: postData}).pipe(map(resp => resp.data)));
			var username = info.login;
			console.log('username = ', username);
			console.log('photo = ', info.image_url);
			const hes = { 
				'responseType': "file"
			}
			var photo = await lastValueFrom(this.httpService.get(info.image_url, {headers: hes}).pipe(map(resp => resp.data)));
			//console.log('photo = ', photo);
			//var blob = await new blob(photo);
			console.log(typeof blob);
			const buffer = Buffer.from(photo);
			// convert binary data to base64 encoded string
			// const buffer = new Buffer(bitmap).toString('base64');
			await this.usersService.addAvatar(buffer , 'intra_photo');
			/* On envoie une erreur au client si le paramètre username est manquant */
			if (!username)
			{
				return res.status(401).json({ message: 'missing_required_parameter', info: 'username' });
			}
			
			// /* On authentifie l'utilisateur */
			// const user = await User.authenticate(username, password);
			
			// /* On envoie une erreur au client si les informations de connexion sont erronées */
			// if (!user) {
				//   return res.status(401).json({
					// 	message: 'Username or password is incorrect'
					//   });
					// }
					
			/* On créer le token CSRF */
			const xsrfToken = await crypto.randomBytes(64).toString('hex');
			
			/* On créer le JWT avec le token CSRF dans le payload */
			const accessToken = await jwt.sign(
				{ firstName: username, xsrfToken },
				'secret',
				{
					algorithm: "HS256"
				 // audience: config.accessToken.audience,
				  //expiresIn: config.accessToken.expiresIn / 1000, // Le délai avant expiration exprimé en seconde
				  //issuer: config.accessToken.issuer,
				}
			  );

			//console.log('accessToken = ', accessToken);
		
		/* On créer le refresh token et on le stocke en BDD */
		//const refreshToken = crypto.randomBytes(128).toString('base64');
		
		// await RefreshToken.create({
		//   userId: user.id,
		//   token: refreshToken,
		//   expiresAt: Date.now() + config.refreshToken.expiresIn
		// });
		
			/* On créer le cookie contenant le JWT */
			res.cookie('access_token', accessToken, {
			  httpOnly: true,
			  secure: true
			});
			//maxAge: config.accessToken.expiresIn
		
		// /* On créer le cookie contenant le refresh token */
		// res.cookie('refresh_token', refreshToken, {
		//   httpOnly: true,
		//   secure: true,
		//   maxAge: config.refreshToken.expiresIn,
		//   path: '/token'
		// });
		
		/* On envoie une reponse JSON contenant les durées de vie des tokens et le token CSRF */
		//res.redirect('http://localhost:3000/home');
		//res.append('xsrfToken', xsrfToken);
		// console.log('just before sendfile');
		// res.sendFile('index.html', {
		//   root: './static',
		// }) ;

		//res.redirect('http://localhost:8080/register');

			res.json({
				//   accessTokenExpiresIn: config.accessToken.expiresIn,
				//   refreshTokenExpiresIn: config.refreshToken.expiresIn,
				xsrfToken
			});
		}
		catch (err)
		{
			return res.status(500).json({ message: 'Internal server error' });
		}
	}
}
