import { forwardRef, Inject, Injectable, NotFoundException, Redirect, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddUserDTO } from './dto/Add-user.dto';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import * as jwt from 'jsonwebtoken'
import { Request, Response } from 'express';
import { parse } from 'cookie';
import { Socket } from 'socket.io';
import { QueryBuilderService } from 'src/generics/class/query-builder.service';
import { Achievement } from 'src/achievement/enums/achievement.enum';
import { UserEntity } from './entities/users.entity';
import { AchievementService } from 'src/achievement/achievement.service';
import { GetUserAchievementListDTO } from './dto/get-user-achievement-list.dto';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserEntity)
		private usersRepositories: Repository<UserEntity>,
		private readonly httpService: HttpService, private readonly jwt: JwtService,
		private readonly chatService : ChatService,
		private qbService : QueryBuilderService,
		@Inject(forwardRef(() => AchievementService))
		private achievementService: AchievementService,
	) { }

	async FindUserById(id: number) {
		const userToFind = await this.usersRepositories.findOne(id);
		if (!userToFind) {
			throw new NotFoundException(`Le User ${id} n'existe pas`);
		}
		return userToFind;
	}

	async GetUser(id: number, ColumnToAdd = null)//: Promise<UserEntity>
	{
		return await this.qbService.Create("user", this.usersRepositories, ColumnToAdd)
							.where("user.id = :id", {id: id})
							.getOne();

	}

	async GetUsers(ColumnToAdd = null): Promise<UserEntity[]> {
		return await this.qbService.Create("user", this.usersRepositories, ColumnToAdd)
									.getMany()
	}

	async AddUser(newUser: AddUserDTO): Promise<UserEntity> {
		try {
			return await this.usersRepositories.save(newUser);
		} catch (error) {
			throw error;
		}
	}

	async UpdateUser(id: number, userModification: Partial<UserEntity>)
	{
		const user = await this.usersRepositories.update({id: id}, {...userModification});
		if (user)
			global.server.emit('refresh_user', "all");
		return user;
	}

	async RemoveUser(id: number) {
		const userToRemove = await this.FindUserById(id);
		return await this.usersRepositories.remove(userToRemove);
	}

	async DeleteUser(id: number) {
		return await this.usersRepositories.delete(id);
	}

	async SoftRemoveUser(id: number) {
		const userToRemove = await this.FindUserById(id);
		return await this.usersRepositories.softRemove(userToRemove);
	}

	async SoftDeleteUser(id: number) {
		return await this.usersRepositories.softDelete(id);
	}

	async RestoreUser(id: number) {
		return await this.usersRepositories.restore(id);
	}

	async SetTfaSecret(id: number, secret: string) {
		return await this.usersRepositories.update(id, { tfaSecret: secret });
	}

	async ActivateTfa(userId: number) {
		await this.usersRepositories.update(userId, { tfaActivated: true })
		this.achievementService.UnlockLocker(await this.GetUser(userId));
	}

	async FindUserByLogin(login: string): Promise<UserEntity> {
		const userToFind = await this.usersRepositories.findOne({ login: login });
		if (!userToFind) {
			return null;
		}
		return userToFind;
	}

	async FindUserByUsername(username: string): Promise<UserEntity> {
		return await this.usersRepositories.findOne({ username: username });
	}

	async register(body, req: Request) {
			var auth = false;
			if (body.tfaActivated)
				auth = true;
			const newUser = {
				login: req.User.login,
				username: body.username,
				tfaActivated: body.tfaActivated,
				guest: req.User.guest
			}
			const user = await this.AddUser(newUser);
			if (user && body.unlock == 'true')
				this.achievementService.UnlockFashion(user);
			return user;
	}

	async isLogin(req: Request) {
		if (req.User && req.User.state == 'ok')
		{
			try {
				if (await this.FindUserById(req.User.id))
					return { log: true };
			}
			catch{}
		}
		return { log: false };
	}

	async isRegister(login: string) {
		const user = await this.FindUserByLogin(login);
		return await user;
	}

	async add_guest(res: Response, request: Request) {
	let user;
	if (request.User)
		user = await this.isRegister(request.User.login);
	if ((user && !user.guest))
		user = null;
	if (!user || user.tfaActivated  || !((await this.isLogin(request)).log))
	{
		var date = new Date().getTime().toString(36);
		var state = 'register';
		var id = -1;
		let username = "guest_" + date;
		let login = username;
		

		if (user) {
			state = 'ok';
			id = user.id;
			username = user.username;
			login = user.login;
		}

		if (state == 'ok' && user.tfaActivated)
			state = '2fa';
		const accessToken = await jwt.sign(
			{ login: login, 'ses': request.sessionID, state: state, id: id, guest: true, username: username },
			'secret',
			{
				algorithm: "HS256"
			}
		);
		res.cookie('access_token', accessToken, {
			httpOnly: true,
			secure: false
		});

		res.json({
			src: "guest.png",
			login: login,
			state: state,
			username: username
		});
		
	}
	else
	{
		res.json({
			src: "guest.png",
			login: user.login,
			state: 'ok',
			username: user.username
		});
	}

	}

	async get_guest(req: Request) {
		return {username: req.User.login};
	}

	async login(res: Response, request: Request) {
		const ret = await this.isLogin(request);
		if (!ret.log) {
			const code = request.body['code'];
			const url = 'https://api.intra.42.fr/oauth/token';
			const postData = {
				grant_type: 'authorization_code',
				client_id: process.env.API_42_ID,
				client_secret: process.env.API_42_SECRET,
				redirect_uri: `http://${process.env.VUE_APP_ADDRESS}/ok`,
				code: code
			}
			var result;
			try {
				result = await lastValueFrom(this.httpService.post(url, postData).pipe(map(resp => resp.data)));
			}
			catch (e) {
			}
			try {
				/* On récupère le nom d'utilisateur dans la requête */
				const url = 'https://api.intra.42.fr/v2/me';
				const postData = {
					'Authorization': 'Bearer ' + result.access_token
				}
				var info = await lastValueFrom(this.httpService.get(url, { headers: postData }).pipe(map(resp => resp.data)));
				var login = info.login;
				if (!login) {
					return res.status(401).json({ message: 'missing_required_parameter', info: 'login' });
				}

				var state = 'register';
				var user;
				var id = -1;
				let username = '';

				if ((user = await this.isRegister(login))) {
					state = 'ok';
					id = user.id;
					username = user.username;
				}
		
				if (state == 'ok' && user.tfaActivated)
					state = '2fa';
				const accessToken = await jwt.sign(
					{ login: login, 'ses': request.sessionID, state: state, id: id, guest: false, username: username },
					'secret',
					{
						algorithm: "HS256"
					}
				);
				res.cookie('access_token', accessToken, {
					httpOnly: true,
					secure: false
				});

				res.json({
					'src': info.image_url,
					login: login,
					state: state,
					username: username
				});
			}
			catch (err) {
				return res.status(500).json({ message: 'Internal server error' });
			}
		}
		else {
			res.redirect(`frontend`)
		}
	}

	async FindUserBySocket(client: Socket): Promise<UserEntity> {
        const cookie = client.handshake.headers['cookie'];
        const { access_token : access_token, instance : instance} = parse(cookie)
		if (instance)
			return null;
		if (!access_token)
			null;
		const decodedToken = jwt.verify(access_token, 'secret', {
            algorithms: ['HS256']
          });
        const id = decodedToken['id']
		
		let user = null;
		try {
			user = await this.FindUserById(id);
		}
		catch {
		}
        return user;
    }

	async UpdateState(user: UserEntity, state: "login" | "logout" | "in match")
	{
		user.state = state;
		if (user)
			global.server.emit('refresh_user', "all");
		await this.usersRepositories.update(user.id, user);
	}

	async AddFriend(user1Id: number, user2Id: number)
	{
		if (user1Id == user2Id)
			return;
		const user1 = await this.GetUser(user1Id, {relation: ["friends"]});
		const user2 = await this.GetUser(user2Id, {relation: ["friends"]});

		const user1Update = {
			id: user1.id,
			friends: [...user1.friends, user2],
			numberOfFriend: user1.numberOfFriend + 1
		}
		const newUser = await this.usersRepositories.save(user1Update);
		this.achievementService.CheckNumberOfFriend(await this.GetUser(newUser.id));
		return newUser;
	}

	async getFriends(id: number)
	{
		const friends_list = (await (await this.GetUser(id, {relation: ['friends']})).friends);
		return friends_list;
	}

	async DeleteFriend(user1Id: number, user2Id: number)
	{
		if (user1Id == user2Id)
			return;
		const user1 = await this.GetUser(user1Id, {relation: ["friends"]});
		const user2 = await this.GetUser(user2Id, {relation: ["friends"]});
		const index = user1.friends.findIndex(element => element.id == user2Id);
		const user1Update = {
			id: user1.id,
			friends: user1.friends.splice(index, 1),
			numberOfFriend: user1.numberOfFriend - 1
		}
		return await this.usersRepositories.save(user1);
	}

	async BlockUser(userWhoBlockId: number, userBlockedId: number)
	{
		try {
			const userWhoBlock = await this.GetUser(userWhoBlockId, {relation: ["blockedUsers"]});
			const userBlocked = await this.GetUser(userBlockedId, {relation: ["blockedUsers"]});
			const userWhoBlockUpdate = {
				id: userWhoBlock.id,
				blockedUsers: [...userWhoBlock.blockedUsers, userBlocked]
			}
			return await this.usersRepositories.save(userWhoBlockUpdate);
		}
		catch
		{

		}
	}

	async UnblockUser(userWhoBlockId: number, userBlockedId: number)
	{
		try {
			const userWhoBlock = await this.GetUser(userWhoBlockId, {relation: ["blockedUsers"]});
			const userBlocked = await this.GetUser(userBlockedId, {relation: ["blockedUsers"]});
			const index = userWhoBlock.blockedUsers.findIndex(element => element.id == userBlockedId);
			if (index == -1)
				return;
			
			userWhoBlock.blockedUsers.splice(index, 1);
			const userWhoBlockUpdate = {
				id: userWhoBlock.id,
				blockedUsers: userWhoBlock.blockedUsers
			}
			return await this.usersRepositories.save(userWhoBlockUpdate);
		}
		catch {
			
		}
	}

	async getBlocked(id: number)
	{
		const list = (await (await this.GetUser(id, {relation: ['blockedUsers']})).blockedUsers);
		let blocked_list = [];
		list.forEach(e => {
			blocked_list.push(e.username);
		})
		return blocked_list;
	}

	async GetUserAchievementList(user: UserEntity)
	{
		const achievements = AchievementService.achievementList;
		let userAchievements: GetUserAchievementListDTO[] = [];
		let mask = 1;
		
		achievements.forEach((element, index) => {
			userAchievements[index] = 
			{
				...element,
				lock: (user.achievementUnlock & mask) == mask ? false : true
			}
			mask = mask << 1;
		});
		return userAchievements;
	}

	async UnlockAchievement(userId: number, achievement: Achievement)
	{
		let user = await this.GetUser(userId);
		achievement = user.achievementUnlock | achievement;
		if (Achievement.mask == (achievement & Achievement.mask))
			achievement = achievement | Achievement.perfectionnist;
		const value = await this.usersRepositories.update({id: user.id}, {achievementUnlock: achievement});
		if (value && global.server)
			global.server.emit("refreshAcheivements", user.username);
		return value;
	}

	AchievementIsSet(user: UserEntity, achievement: Achievement)
	{
		if ((user.achievementUnlock & achievement) == achievement)
			return true;
		return false;
	}

	async GetLeaderboard(limit: number = 0)
	{
		return await this.qbService.Create("users", this.usersRepositories)
					.limit(limit)
					.orderBy("users.elo", "DESC")
					.getMany()
	}

	async GetUserPublicProfile(id: number)
	{
		const profilrepo = this.qbService.Create("user", this.usersRepositories)
	
		return profilrepo.where("id = :id", { id: id })
						.getOne()
	}

	async InitStateUsersInDB()
	{
		global.init = false;
		let user = {
			state: 'logout'
		}
		return await this.usersRepositories.update({}, user);
	}
}