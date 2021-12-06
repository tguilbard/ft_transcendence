import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/users.entity';
import { AddUserDTO } from './dto/Add-user.dto';
import { UpdateUserDTO } from './dto/Update-user.dto';

import DatabaseFilesService from '../Photo/databaseFiles.service';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class UsersService {
	constructor (
		@InjectRepository(UserEntity)
		private usersRepositories : Repository<UserEntity>,
		private readonly databaseFilesService: DatabaseFilesService,
    	private readonly httpService: HttpService, private readonly jwt: JwtService
	){}

	async FindUserById(id : number) {
		const userToFind = await  this.usersRepositories.findOne(id);
		if (!userToFind)
		{
			throw new NotFoundException(`Le User ${id} n'existe pas`);
		}
		return userToFind;
	}

	async GetUsers() : Promise<UserEntity[]> {
		return await this.usersRepositories.find();
	}

	async AddUser(newUser: AddUserDTO) : Promise<UserEntity> {
		console.log('je suis dans AddUser');
		return await this.usersRepositories.save(newUser);
	}

	async UpdateUser(id : number, userMofidication: UpdateUserDTO) : Promise<UserEntity> {
		console.log(userMofidication);
		const userChanged =  await this.usersRepositories.preload({
			id : id,
			...userMofidication
		});
		return await this.usersRepositories.save(userChanged);
	}

	async RemoveUser(id : number) {
		const userToRemove = await this.FindUserById(id);
		return await this.usersRepositories.remove(userToRemove);
	}

	async DeleteUser(id : number) {
		return await this.usersRepositories.delete(id);
	}

	async SoftRemoveUser(id : number) {
		const userToRemove = await this.FindUserById(id);
		return await this.usersRepositories.softRemove(userToRemove);
	}

	async SoftDeleteUser(id : number) {
		return await this.usersRepositories.softDelete(id);
	}

	async RestoreUser(id : number) {
		//const userToRecover = await this.FindUserById(id);
		return await this.usersRepositories.restore(id);
	}

	async SetTfaSecret(id : number, secret: string)
	{
		return await this.usersRepositories.update(id, { tfaSecret: secret });
	}

	async ActivateTfa(userId: number)
	{
		return await this.usersRepositories.update(userId, {tfaActivated : true})
	}

	async DesactivateTfa(userId: number)
	{
		return await this.usersRepositories.update(userId, {tfaActivated : false})
	}


	////////////////////////////////////////////////////////////


	async FindUserByLogin(login : string) {
		const userToFind = await  this.usersRepositories.findOne({login: login});
		if (!userToFind)
		{
			return "";
			//throw new NotFoundException(`Le User ${login} n'existe pas`);
		}
		return userToFind;
	}

	async addAvatar(imageBuffer: Buffer, filename: string) {
		console.log(imageBuffer);
		const avatar = await this.databaseFilesService.uploadDatabaseFile(imageBuffer, filename);
		console.log('ID = ', avatar.id);
		await this.usersRepositories.update(5, {
		  avatarId: avatar.id
		});
		return avatar;
	  }
	
	  async register(body, response) {
		console.log("login = ", response.User);
		console.log(body);
		var auth = false;
		if (body.tfaActivated == 'on')
			auth = true;
		const newUser = {
			login: response.User,
			username: body.username,
			tfaActivated: body.tfaActivated
		}

		//this.AddUser(newUser);
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
		const avatar = await this.databaseFilesService.getFileById(1)
		return avatar;
	  }
	
	  async isRegister(username) {
		const user = this.FindUserByLogin(username);
		console.log('je suis dans isRegister')
		return user;
	  }
	
	  async login(response, request) {
		  console.log("je suis dans login");
		  console.log(response.User);
		if (!response.State) {
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
	
			if (!username) {
			  return response.status(401).json({ message: 'missing_required_parameter', info: 'username' });
			}
	
			var state = false;
			var user;
			var id = -1;
			if ((user = await this.isRegister(username)))
			{
				state = true;
				id = user.id;
			}
			console.log('state = ', state);
			console.log('login = ', username);
			const accessToken = await jwt.sign(
			  { login: username, 'ses': request.sessionID, state: state, id: id },
			  'secret',
			  {
				algorithm: "HS256"
			  }
			);
			response.cookie('access_token', accessToken, {
			  httpOnly: true,
			  secure: true
			});
			console.log('cookie was set');
	
			response.json({
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
