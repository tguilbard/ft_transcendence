export interface UserEntity {
	id?: number,
	login?: string,
	username?: string,
	state?: string,
	elo?: number,
	tfaSecret?: string,
	tfaActivated?: boolean,
	mode?: number
}

export interface ChannelEntity {
	id: number,
	name: string,
	mode: number,
	realname: string
}

export interface Achievements {
	id: number,
	name: string,
	description: string,
	imageUnlockName: string,
	imageLockName: string,
	lock: boolean
}

export interface MessagesList {
	[key: string]: Message[]
}

export interface Match {
	user1: UserEntity,
	user2: UserEntity,
	scoreUser1: number,
	scoreUser2: number
}

export class Message {
	username: string;
	message: string;
	time: string;
	colored: boolean;

	constructor(user?: string, content?: string) {
		this.message = "";
		this.time = this.getTime();
		this.username = "Root";
		this.colored = false;
		if (content)
			this.message = content;
		if (user)
			this.username = user;
	}
	getTime(): string {
		const date_ob = new Date();
		const date = ("0" + date_ob.getDate()).slice(-2);
		const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
		const year = date_ob.getFullYear();
		const hours = date_ob.getHours();
		const minutes = date_ob.getMinutes();
		const seconds = date_ob.getSeconds();

		return (year + "/" + month + "/" + date + " " + hours + ":" + minutes + ":" + seconds);
	}
}
