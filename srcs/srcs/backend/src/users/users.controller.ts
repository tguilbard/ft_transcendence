import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Delete, Res, Req } from '@nestjs/common';
import { AddUserDTO } from './dto/Add-user.dto';
import { UpdateUserDTO } from './dto/Update-user.dto';
import { UserEntity } from './entities/users.entity';
import { UsersService } from './users.service';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import AvatarService from './avatar/avatar.service';
import { UpdateResult } from 'typeorm';
import * as jwt from 'jsonwebtoken';

@Controller('users')
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly avatarService: AvatarService,
	) { }

	@Get("all")
	async GetAllUsers(): Promise<UserEntity[]> {
		return await this.usersService.GetUsers();
	}
	
	@Get()
	async GetUser(@Req() req: Request): Promise<UserEntity> {
		return await this.usersService.FindUserByLogin(req.User.login);
	}
	
	async GetUsers(@Req() req: Request): Promise<UserEntity> {
		return await this.usersService.FindUserById(req.User.id);
	}

	@Get('friends')
	async getFriends(@Req() req: Request){
		return await this.usersService.getFriends(req.User.id);
	}

	@Get('isFriend/:username')
	async isFriendByUsername(@Param('username') username: number, @Req() req: Request){
		const list = await this.usersService.getFriends(req.User.id);
		const friend = list.find(e => e.username == username);
		if (!friend)
			return false;
		return true;
	}

	@Get('logout')
	async logout(@Req() req: Request, @Res() res: Response)
	{
		res.clearCookie('access_token');
		const accessToken = await jwt.sign(
			{ login: req.User.login, 'ses': req.sessionID, state: 'logout', id: req.User.id, username: req.User.username, guest: req.User.guest },
			process.env.SESSION_SECRET,
			{
				algorithm: "HS256"
			}
		);
		res.status(204).cookie('access_token', accessToken, {
			httpOnly: true,
			secure: false
		});
		res.send(
			{
				status: 'ok'
			}
		);
	}

	@Get('MyUser')
	async GetMyUser(@Req() req: Request): Promise<UserEntity>{
		if (!req.User || !req.User.id)
			return await this.usersService.FindUserById(0);
		const user = await this.usersService.FindUserById(req.User.id);
		return user;
	}

	@Post()
	async AddUser(@Body() addUserDTO: AddUserDTO): Promise<UserEntity> {
		return await this.usersService.AddUser(addUserDTO);
	}

	@Post('register')
	@UseInterceptors(FileInterceptor('img'))
	async register(@UploadedFile() file: Express.Multer.File, @Req() req: Request, @Body() body: AddUserDTO, @Res() response: Response) {
		const user = await this.usersService.register(body, req);
		if (user) {
			await this.avatarService.addAvatar(file.buffer, file.originalname, req);
			response.send({ "resultat": 'ok' });
		}
		else {
			response.send();
		}
	}

	@Post('isRegister')
	async isRegister(@Req() req: Request) {
		return await this.usersService.isRegister(req.User.login);
	}

	@Get('isLogin')
	async isLogin(@Req() req: Request) {
		return await this.usersService.isLogin(req);
	}

	@Get('isGuest/:username')
	async isGuest(@Param("username") username: string) {
		const user = await this.usersService.FindUserByUsername(username);
		if (user && user.guest)
			return true;
		return false;
	}

	@Get('myGuest')
	async myGuest(@Req() req: Request) {
		if (req.User && req.User.guest)
			return true;
		return false;
	}

	@Post('login')
	async login(@Res() response: Response, @Req() request: Request) {
		this.usersService.login(response, request);
	}

	@Post('guest')
	async add_guest(@Res() response: Response, @Req() request: Request) {
		"je suis dans add gest"
		return await this.usersService.add_guest(response, request);
	}

	@Get('guest')
	async get_guest(@Req() request: Request) {
		return await this.usersService.get_guest(request);
	}

	@Get('recover/:id')
	async RestoreUser(@Param("id", ParseIntPipe) id: number) {
		return await this.usersService.RestoreUser(id);
	}

	@Patch('update')
	async UpdateUser(
		@Body() updateUserDTO: UpdateUserDTO,
		@Req() req: Request): Promise<UpdateResult> {
		return await this.usersService.UpdateUser(req.User.id, updateUserDTO);
	}

	@Get("leaderboard")
	async GetAllLeaderboard()
	{
		return await this.usersService.GetLeaderboard();
	}

	@Get("leaderboard/:limit")
	async GetLeaderboard(@Param("limit", ParseIntPipe) limit: number)
	{
		return await this.usersService.GetLeaderboard(limit);
	}

	@Patch(":id")
	async UpdateUserById(
		@Body() updateUserDTO: UpdateUserDTO,
		@Param('id', ParseIntPipe) id: number): Promise<UpdateResult> {
		return await this.usersService.UpdateUser(id, updateUserDTO);
	}

	@Delete(":id")
	async RemoveUser(@Param('id', ParseIntPipe) id: number) {
		return await this.usersService.SoftDeleteUser(id);
	}
	
	@Get("other/:id")
	async GetUserByUsername(@Param("id") username: string): Promise<UserEntity>{//: Promise<UserEntity> {
		return await this.usersService.FindUserByUsername(username);
	}
	
	@Get("blocked")
	async getBlocked(@Req() req: Request){
		return await this.usersService.getBlocked(req.User.id);
	}

	@Get(":id")
	async GetUserById(@Param("id", ParseIntPipe) id: number): Promise<UserEntity> {
		return await this.usersService.FindUserById(id);
	}

	@Get(":username/achievements")
	async GetUserAchievementList(@Param("username") username: string) {
		const user = await this.usersService.FindUserByUsername(username);
		return await this.usersService.GetUserAchievementList(await this.GetUserById(user.id));
	}

	@Post("friend/:id1/:id2")
	async addFriend(@Param("id1") id1: number, @Param("id2") id2: number)
	{
		return await this.usersService.AddFriend(id1, id2);
	}

	@Delete("friend/:id1/:id2")
	async deleteFriend(@Param("id1") id1: number, @Param("id2") id2: number)
	{
		return await this.usersService.DeleteFriend(id1, id2);
	}

	@Post("block/:id1/:id2")
	async BlockUser(@Param("id1") id1: number, @Param("id2") id2: number)
	{
		return await this.usersService.BlockUser(id1, id2);
	}

	@Delete("unblock/:id1/:id2")
	async UnblockUser(@Param("id1") id1: number, @Param("id2") id2: number)
	{
		return await this.usersService.UnblockUser(id1, id2);
	}
}
