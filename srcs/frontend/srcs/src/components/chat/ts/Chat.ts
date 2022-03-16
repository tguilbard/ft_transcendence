import { Options, Vue } from 'vue-class-component';
import ChanBut from '@/components/chat/ChanBut.vue';
import Menu from "@/components/Menu.vue"; // @ is an alias to /src
import PopUp from '@/components/PopUp.vue'
import store from '@/store';
import { NavigationFailure } from 'vue-router';
import shared from "@/mixins/Mixins";
import { mapGetters } from 'vuex'
import { ChannelEntity, Message, UserEntity } from '@/interface/interface';
import { MemberType } from "@/enums/enums";

@Options({
	components: {
		ChanBut,
		Menu,
		PopUp
	},
	computed: {
		...mapGetters([
			'GET_USER',
			'GET_POPUP',
			'GET_USER_TARGET',
			'GET_ROOM',
			'GET_CHAN',
			'GET_CHAN_PRIVATE',
			'GET_CHAN_CURRENT',
			'GET_LIST_CHAN_PUBLIC',
			'GET_LIST_CHAN_PRIVATE',
			'GET_LIST_USER_CURRENT',
			'GET_LIST_MESSAGES',
			'GET_MY_MODE',
			'GET_IS_FRIEND',
		]),
	}
})
export default class Chat extends Vue {
	private inputMsg = '';
	private colored = false;
	private listUsers = false;
	private size = 0;

	get getUserBtn() {
		if (this.size <= 700)
			return true;
		return false;
	}

	get getListUsers() {
		return this.listUsers;
	}

	private setSize()
	{
		this.size = window.innerWidth;
	}

	async created(): Promise<void | NavigationFailure> {
		if (!await shared.isLogin())
			return this.$router.push("/login");
		if (!store.state.sock_init) await store.commit("SET_SOCKET");
		this.setSize();
		window.addEventListener(
      'resize', this.setSize);
		const user = await shared.getMyUser();
		if (user.state == 'logout')
			user.state = 'login';
		store.dispatch("SET_USER", user);
		store.dispatch("SET_LIST_BLOCKED", await shared.getListBlocked());
		await this.listen();
		await this.initClient();
	}

	private async initClient() {
		await store.dispatch("SET_MY_MODE", await this.getMyMode());
		await this.getMessagesInChannel(store.getters.GET_CHAN_CURRENT.realname);

		let tmp = await this.getChanListByMode('public');
		if (tmp && tmp.length)
		{
			tmp.forEach(e => {
				e.realname = e.name;
				e.name = '';
			})
			if (!store.getters.GET_CHAN.realname && tmp.length)
				store.dispatch("SET_CHAN", tmp[0]);
			await store.dispatch("SET_LIST_CHAN_PUBLIC", tmp);
	
		}
		tmp = await this.getChanListByMode('private');
		if (tmp && tmp.length)
		{
			tmp.forEach(e => {
				e.realname = e.name;
				e.name = '';
				if (e.mode == 8) {
					e.name = e.realname.substring(e.realname.indexOf('-') + 2);
					if (e.name == store.getters.GET_USER.username)
						e.name = e.realname.substring(0, e.realname.indexOf('-') - 1);
				}
			})
			if (!store.getters.GET_CHAN_PRIVATE.realname && tmp.length) {
				store.dispatch("SET_CHAN_PRIVATE", tmp[0]);
			}
		}
		if (store.getters.GET_ROOM)
			store.dispatch("SET_CHAN_CURRENT", store.getters.GET_CHAN);
		else
			store.dispatch("SET_CHAN_CURRENT", store.getters.GET_CHAN_PRIVATE);
		await store.dispatch("SET_LIST_USER_CURRENT", await shared.getUserInChan(store.getters.GET_CHAN_CURRENT.realname));
		store.dispatch("SET_LIST_CHAN_PRIVATE", tmp);
	}

	private isBlock(username: string) {
		return store.getters.GET_LIST_BLOCKED.find(e => e == username);
	}

	private setPopup(value: string): void {
		store.dispatch("SET_POPUP", value);
	}

	public postMSG(e: { preventDefault: () => void; target: { value: string; }; }): false | undefined {
		e.preventDefault();

		const msg = this.inputMsg;

		msg.trim();

		if (!msg) {
			return false;
		}

		if (msg.substring(0, 7) === "/block ") {
			if (store.getters.GET_LIST_BLOCKED.indexOf(msg.substring(7)) === -1) {
				store.getters.GET_LIST_BLOCKED.push(msg.substring(7));
			}
		}
		else if (msg.substring(0, 9) === "/unblock ") {
			const index: number = store.getters.GET_LIST_BLOCKED.indexOf(msg.substring(9));
			if (index != -1)
				store.getters.GET_LIST_BLOCKED.splice(index, 1);
		}
		else if (msg.substring(0, 6) === "/mute ") {
			const data = msg.split(" ", 3);
			store.state.socket.emit('muteUserServer', data[1], store.getters.GET_CHAN_CURRENT.realname, data[2]);
		}
		else if (msg.substring(0, 8) === "/unmute ") {
			const name: string = msg.substring(8);
			store.state.socket.emit('unmuteUserServer', name, store.getters.GET_CHAN_CURRENT.realname);
		}
		else if (msg.substring(0, 5) === "/ban ") {
			const data = msg.split(" ", 3);
			store.state.socket.emit('banUserServer', data[1], store.getters.GET_CHAN_CURRENT.realname, data[2]);
		}
		else if (msg.substring(0, 7) === "/unban ") {
			const name: string = msg.substring(7);
			store.state.socket.emit('unbanUserServer', name, store.getters.GET_CHAN_CURRENT.realname);
		}
		else if (msg.substring(0, 6) === "/join ") {
			const data = msg.split(" ", 3);
			shared.joinPublic(data[1], data[2]);
		}
		else if (msg.substring(0, 4) === "/pm ") {
			this.joinPrivateMessage(msg.substring(4));
		}
		else if (msg.substring(0, 4) === "/cp ") {
			shared.joinPrivate(msg.substring(4));
		}
		else if (msg.substring(0, 5) === "/inv ") {
			store.state.socket.emit('invite', msg.substring(5), store.getters.GET_CHAN_CURRENT.realname);
		}
		else if (msg.substring(0, 7) === "/admin ") {
			store.state.socket.emit('setAdmin', msg.substring(7), store.getters.GET_CHAN_CURRENT.realname);
		}
		else if (msg.substring(0, 8) === "/uadmin ") {
			store.state.socket.emit('unsetAdmin', msg.substring(8), store.getters.GET_CHAN_CURRENT.realname);
		}
		else if (msg.substring(0, 5) === "/mod ") {
			store.state.socket.emit('displayMods', msg.substring(5), store.getters.GET_CHAN_CURRENT.realname);
		}
		else if (msg.substring(0, 6) === "/pass ") {
			const pass = msg.substring(6).replace(/\s/g, "");
			store.state.socket.emit('passChan', pass, store.getters.GET_CHAN_CURRENT.realname);
		}
		else {
			const newMsg = new Message(store.getters.GET_USER.username, msg);
			if (store.getters.GET_ROOM) {
				store.state.socket.emit('msgToServer', newMsg, store.getters.GET_CHAN.realname);
			}
			else {
				store.state.socket.emit('msgToServerPrivate', newMsg, store.getters.GET_CHAN_PRIVATE.realname);
			}
		}
		this.inputMsg = '';
	}

	private async active_pop_add(): Promise<void> {
		store.dispatch("SET_CHANNEL_TARGET", {})
		await store.dispatch("SET_LIST_CHANNEL_PUBLIC", await this.getListChannelPublic());
		await store.dispatch("SET_LIST_USER_GENERAL", await shared.getUserInChan("General"));
		store.dispatch("SET_POPUP", 'add');
		store.dispatch("SET_SAVE_POPUP");
	}

	private async active_pop_create(): Promise<void> {
		store.dispatch("SET_POPUP", 'create');
		store.dispatch("SET_SAVE_POPUP");
	}

	private async active_pop_pass(): Promise<void> {
		store.dispatch("SET_POPUP", 'pass');
		store.dispatch("SET_SAVE_POPUP");
	}

	private async active_pop_profil_mode(user_target: UserEntity): Promise<void> {
		if (user_target.state == '')
			user_target = await shared.getUserByUsername(user_target.username);
		store.dispatch("SET_USER_TARGET", user_target);
		await store.dispatch("SET_MODE", await this.getMode(user_target.username));
		store.dispatch("SET_POPUP", 'profil_mode');
		store.dispatch("SET_SAVE_POPUP");
		store.dispatch("SET_IS_FRIEND", await shared.isFriendByUsername());
		store.dispatch("SET_LIST_ACHIEVEMENTS_TARGET", await shared.getAchievements(store.getters.GET_USER_TARGET.username));
		await store.dispatch("SET_IMG_TARGET", await shared.get_avatar(user_target.username));
		store.dispatch("SET_LIST_MATCH_TARGET", await shared.getListMatchs(user_target.username));

	}

	private async changeChannel(channel: ChannelEntity): Promise<void> {
		store.dispatch("SET_CHAN_CURRENT", channel);
		if (store.getters.GET_ROOM)
			store.dispatch("SET_CHAN", channel);
		else {
			store.dispatch("SET_CHAN_PRIVATE", channel);
		}
		await this.getMessagesInChannel(channel.realname);
		await store.dispatch("SET_LIST_USER_CURRENT", await shared.getUserInChan(channel.realname));
		await store.dispatch("SET_MY_MODE", await this.getMyMode());

	}

	private async changeRoom(room: boolean): Promise<void> {
		store.dispatch("SET_ROOM", room);
		if (store.getters.GET_ROOM) {
			store.dispatch("SET_CHAN_CURRENT", store.getters.GET_CHAN);
		}
		else {
			store.dispatch("SET_CHAN_CURRENT", store.getters.GET_CHAN_PRIVATE);
		}
		await this.refresh();
	}

	updated(): void {
		const container = this.$el.querySelector(".chatbox");
		container.scrollTop = container.scrollHeight;
	}

	private async conf(channel: ChannelEntity): Promise<void> {
		if (typeof channel !== 'undefined') {
			store.dispatch("SET_CHAN_CURRENT", channel);
			store.dispatch("SET_SAVE_POPUP");
			store.dispatch("SET_POPUP", 'inv');
		}
	}

	private outputMessage(message: Message, channel: ChannelEntity): void {

		const tab_message = store.getters.GET_LIST_MESSAGES_BY_CHAN[channel.realname];

		if (tab_message && tab_message.length)
		{
			this.colored = tab_message[tab_message.length - 1].colored;
			if (tab_message[tab_message.length - 1].username != message.username) {
				if (this.colored)
					this.colored = false;
				else
					this.colored = true;
			}
		}
		message.colored = this.colored;
		tab_message.push(message);
		const listMessage = store.getters.GET_LIST_MESSAGES_BY_CHAN;
		listMessage[channel.realname] = tab_message;
		store.dispatch("SET_LIST_MESSAGES_BY_CHAN", listMessage)
		if (store.getters.GET_CHAN_CURRENT.realname == channel.realname)
			store.dispatch("SET_LIST_MESSAGES", tab_message);
	}

	private joinPrivateMessage(target: string): void {
		store.state.socket.emit('joinPrivateMessage', target);
	}

	private quit_channel(): void {
		store.state.socket.emit('leaveChanServer', store.getters.GET_CHAN_CURRENT.realname);
	}

	private async refresh() {
		await store.dispatch("SET_MY_MODE", await this.getMyMode());
		if (!store.getters.GET_CHAN_CURRENT.realname)
		{
			store.dispatch("SET_LIST_MESSAGES_BY_CHAN", [])
			store.dispatch("SET_LIST_MESSAGES", []);
		}
		else
			await this.getMessagesInChannel(store.getters.GET_CHAN_CURRENT.realname);
		await store.dispatch("SET_LIST_USER_CURRENT", await shared.getUserInChan(store.getters.GET_CHAN_CURRENT.realname));
		if (store.getters.GET_ROOM) {
			const tmp = await this.getChanListByMode('public');
			tmp.forEach(e => {
				e.realname = e.name;
				e.name = '';
			})
			await store.dispatch("SET_LIST_CHAN_PUBLIC", tmp);
		}
		else {
			const tmp = await this.getChanListByMode('private');
			tmp.forEach(e => {
				e.realname = e.name;
				e.name = '';
				if (e.mode == 8) {
					e.name = e.realname.substring(e.realname.indexOf('-') + 2);
					if (e.name == store.getters.GET_USER.username)
						e.name = e.realname.substring(0, e.realname.indexOf('-') - 1);
				}
			})
			store.dispatch("SET_LIST_CHAN_PRIVATE", tmp);
		}
	}

	private modeIsSet(num: number, mode: string): boolean {
		let mode_set: number;
		switch(mode) {
			case "owner":
				mode_set = MemberType.owner;
				break;
			case "admin":
				mode_set = MemberType.admin;
				break;
			case "mute":
				mode_set = MemberType.mute;
				break;
			case "ban":
				mode_set = MemberType.ban;
				break;
		}
		if (num & mode_set)
			return true;
		return false;
	}

	private async getMode(user_target: string) {
		const response = await fetch("http://localhost:3000/channel/mode/" + store.getters.GET_CHAN_CURRENT.realname + "/" + user_target, {
			method: "GET",
			mode: "cors",
			credentials: "include",
			headers: {
				Accept: "application/json",
				"Access-Control-Max-Age": "600",
				"Cache-Control": "no-cache",
			},
		});
		if (response.ok)
			return response.json();
		return false;
	}

	private async getMyMode() {
		const chanCurrent = store.getters.GET_CHAN_CURRENT;
		if (!chanCurrent || !chanCurrent.realname)
			return;
		const response = await fetch("http://localhost:3000/channel/mode/" + store.getters.GET_CHAN_CURRENT.realname + "/" + store.getters.GET_USER.username, {
			method: "GET",
			mode: "cors",
			credentials: "include",
			headers: {
				Accept: "application/json",
				"Access-Control-Max-Age": "600",
				"Cache-Control": "no-cache",
			},
		});
		if (response.ok)
			return response.json();
		return false;
	}

	private async getListChannelPublic() {
		const response = await fetch("http://localhost:3000/channel/ListChannelPublic", {
			method: "GET",
			mode: "cors",
			credentials: "include",
			headers: {
				Accept: "application/json",
				"Access-Control-Max-Age": "600",
				"Cache-Control": "no-cache",
			},
		});
		if (response.ok)
			return response.json();
		return [];
	}

	private async getMessagesInChannel(chanName: string) {
		const response = await fetch("http://localhost:3000/channel/MessagesInChannel/" + chanName, {
			method: "GET",
			mode: "cors",
			credentials: "include",
			headers: {
				Accept: "application/json",
				"Access-Control-Max-Age": "600",
				"Cache-Control": "no-cache",
			},
		});
		if (response.ok) {
			const resp = await response.json();
			const listMessage = store.getters.GET_LIST_MESSAGES_BY_CHAN;
			listMessage[chanName] = resp;
			store.dispatch("SET_LIST_MESSAGES_BY_CHAN", listMessage)
			store.dispatch("SET_LIST_MESSAGES", resp);
		}
	}

	private async getChanListByMode(chanMode: string): Promise<ChannelEntity[]> {
		const response = await fetch("http://localhost:3000/getChanListByMode/" + chanMode, {
			method: "GET",
			mode: "cors",
			credentials: "include",
			headers: {
				Accept: "application/json",
				"Access-Control-Max-Age": "600",
				"Cache-Control": "no-cache",
			},
		});
		if (response.ok)
			return response.json();
		return [];
	}

	private async listen() {
		store.state.socket.off('changeUsername').on("changeUsername",
			async (payload: [{ oldname: string, newname: string, oldchan: string, newchan: string }]) => {
	
				if (store.getters.GET_USER_TARGET.username == payload[0].oldname)
					store.dispatch("SET_USER_TARGET", await shared.getUserByUsername(payload[0].newname));
				if (store.getters.GET_POPUP)
					store.dispatch("SET_LIST_MATCH_TARGET", await shared.getListMatchs(store.getters.GET_USER_TARGET.username));
	
				const tmp = await this.getChanListByMode('private');
				tmp.forEach(e => {
					e.realname = e.name;
					e.name = '';
					if (e.mode == 8) {
						e.name = e.realname.substring(e.realname.indexOf('-') + 2);
						if (e.name == store.getters.GET_USER.username)
							e.name = e.realname.substring(0, e.realname.indexOf('-') - 1);
						payload.forEach(c => {
							if (e.realname == c.newchan && store.getters.GET_CHAN_PRIVATE.realname == c.oldchan)
								store.dispatch("SET_CHAN_PRIVATE", e);
							if (e.realname == c.newchan && store.getters.GET_CHAN_CURRENT.realname == c.oldchan)
								store.dispatch("SET_CHAN_CURRENT", e);
						})
					}
				})
				await this.getMessagesInChannel(store.getters.GET_CHAN_CURRENT.realname);
				store.dispatch("SET_LIST_CHAN_PRIVATE", tmp);
				await store.dispatch("SET_LIST_USER_CURRENT", await shared.getUserInChan(store.getters.GET_CHAN_CURRENT.realname));
			});
	
		store.state.socket.off('setMod').on('setMod', (mod: number) => {
			store.dispatch("SET_MODE", mod);
		});
	
		store.state.socket.off('setPassMode').on('setPassMode', (passMode: { mode: number, chanName: string }) => {
			const tmp = store.state.listChannel;
	
			tmp.forEach(e => {
				if (e.realname == passMode.chanName && e.mode != passMode.mode)
					e.mode = passMode.mode;
			})
			store.dispatch("SET_LIST_CHAN_PUBLIC", tmp);
		});
	
		store.state.socket.off('setMyMod').on('setMyMod', (mod: number, chanName: string) => {
			if (store.getters.GET_CHAN_CURRENT.realname == chanName)
				store.dispatch("SET_MY_MODE", mod);
		});
	
		store.state.socket.off('msgToClient').on('msgToClient', (newMsg: Message, channel: ChannelEntity) => {
	
			channel.realname = channel.name;
			channel.name = '';
			if (typeof newMsg !== 'undefined' && typeof channel !== 'undefined') {
				if (store.getters.GET_LIST_BLOCKED.indexOf(newMsg.username) === -1) {
					const tmp = store.state.listChannel;
					if (!tmp.find(e => e.realname == channel.realname)) {
						tmp.push(channel);
						const listMessage = store.getters.GET_LIST_MESSAGES_BY_CHAN;
						listMessage[channel.realname] = [];
						store.dispatch("SET_LIST_MESSAGES_BY_CHAN", listMessage)
						store.dispatch("SET_CHAN_CURRENT", channel);
						store.dispatch("SET_LIST_CHAN_PUBLIC", tmp);
					}
					this.outputMessage(newMsg, channel);
				}
			}
		});
	
		store.state.socket.off('msgToClientPrivate').on('msgToClientPrivate', (newMsg: Message, channel: ChannelEntity) => {
			channel.realname = channel.name;
			channel.name = '';
			if (typeof newMsg !== 'undefined' && typeof channel !== 'undefined') {
				if (store.getters.GET_LIST_BLOCKED.indexOf(newMsg.username) === -1) {
					const tmp = store.state.chanPrivate;
					if (!tmp.find(e => e.realname == channel.realname)) {
						if (channel.mode == 8) {
							channel.name = channel.realname.substring(channel.realname.indexOf('-') + 2);
							if (channel.name == store.getters.GET_USER.username)
								channel.name = channel.realname.substring(0, channel.realname.indexOf('-') - 1);
						}
						const listMessage = store.getters.GET_LIST_MESSAGES_BY_CHAN;
						listMessage[channel.realname] = [];
						store.dispatch("SET_LIST_MESSAGES_BY_CHAN", listMessage)
	
						tmp.push(channel);
						store.dispatch("SET_LIST_CHAN_PRIVATE", tmp)
						
						if (!store.getters.GET_POPUP)
						{
							store.dispatch("SET_CHAN_CURRENT", channel);
							store.dispatch("SET_CHAN_PRIVATE", channel);
							store.dispatch("SET_ROOM", false);
							store.dispatch("SET_MSG_ALERT", newMsg.username + " send to you a message private");
							store.dispatch("SET_POPUP", 'alert');
						}
					}
					this.outputMessage(newMsg, channel);
				}
			}
		});
	
		store.state.socket.off('chanToClient').on('chanToClient', async (userMode: number, channel: ChannelEntity) => {
			channel.realname = channel.name;
			channel.name = '';
			if (typeof channel !== 'undefined') {
				const tmp = store.state.listChannel;
				if (!tmp.find(e => e.realname == channel.realname)) {
					tmp.push(channel);
				}
				store.dispatch("SET_MY_MODE", userMode);
				await this.getMessagesInChannel(channel.realname);
				await store.dispatch("SET_LIST_USER_CURRENT", await shared.getUserInChan(channel.realname));
				store.dispatch("SET_CHAN", channel);
				store.dispatch("SET_CHAN_CURRENT", channel);
				store.dispatch("SET_LIST_CHAN_PUBLIC", tmp);
			}
		});
	
		store.state.socket.off('alertMessage').on('alertMessage', async (msg: string) => {
			if (store.getters.GET_POPUP == "alert" || store.getters.GET_POPUP == "inv" || store.getters.GET_POPUP == "inv_game" )
				return;
			store.dispatch("SET_SAVE_POPUP");
			store.dispatch("SET_MSG_ALERT", msg);
			store.dispatch("SET_POPUP", 'alert' + store.getters.GET_POPUP);
		});
	
		store.state.socket.off('goMsg').on('goMsg', async (channel: ChannelEntity) => {
			channel.realname = channel.name;
			channel.name = '';
			store.dispatch("SET_ROOM", false);
			channel.name = channel.realname.substring(channel.realname.indexOf('-') + 2);
			if (channel.name == store.getters.GET_USER.username)
				channel.name = channel.realname.substring(0, channel.realname.indexOf('-') - 1);
			store.dispatch("SET_CHAN_PRIVATE", channel);
			store.dispatch("SET_CHAN_CURRENT", channel);
			store.dispatch("SET_POPUP", '');
			store.dispatch("SET_SAVE_POPUP");
	
			await this.refresh();
			return this.$router.push("/chat");
		});
	
		store.state.socket.off('chanToClientPrivate').on('chanToClientPrivate', async (userMode: number, channel: ChannelEntity) => {
			channel.realname = channel.name;
			channel.name = '';
			if (typeof channel !== 'undefined') {
				const tmp = store.state.chanPrivate;
				if (!tmp.find(e => e.realname == channel.realname)) {
					const listMessage = store.getters.GET_LIST_MESSAGES_BY_CHAN;
					listMessage[channel.realname] = [];
					store.dispatch("SET_LIST_MESSAGES_BY_CHAN", listMessage)
	
					if (channel.mode == 8) {
						channel.name = channel.realname.substring(channel.realname.indexOf('-') + 2);
						if (channel.realname == store.getters.GET_USER.username)
							channel.name = channel.realname.substring(0, channel.realname.indexOf('-') - 1);
						store.dispatch("SET_CHAN_PRIVATE", channel);
						store.dispatch("SET_CHAN_CURRENT", channel);
	
					}
					store.dispatch("SET_CHAN_PRIVATE", channel);
					store.dispatch("SET_CHAN_CURRENT", channel);
					tmp.push(channel);
					store.dispatch("SET_LIST_CHAN_PRIVATE", tmp);
				}
				store.dispatch("SET_MY_MODE", userMode);
				store.dispatch("SET_ROOM", false);
				await this.getMessagesInChannel(channel.realname);
				await store.dispatch("SET_LIST_USER_CURRENT", await shared.getUserInChan(channel.realname));
			}
		});
	
		store.state.socket.off('refresh_user').on('refresh_user', async (chanName: string) => {
			if (chanName == "all" || store.getters.GET_CHAN_CURRENT.realname == chanName) {
				await store.dispatch("SET_LIST_USER_CURRENT", await shared.getUserInChan(store.getters.GET_CHAN_CURRENT.realname));
				store.dispatch("SET_USER_TARGET", await shared.getUserByUsername(store.getters.GET_USER_TARGET.username));
				if (store.getters.GET_POPUP)
					store.dispatch("SET_LIST_MATCH_TARGET", await shared.getListMatchs(store.getters.GET_USER_TARGET.username));
				else
					store.dispatch("SET_LIST_MATCH", await shared.getListMatchs(store.getters.GET_USER.username));
			}
			await store.dispatch("SET_LIST_USER_GENERAL", await shared.getUserInChan("General"));
		});
	
		store.state.socket.off('refresh_friends').on('refresh_friends', async () => {
			store.dispatch("SET_IS_FRIEND", await shared.isFriendByUsername());
		});
	
		store.state.socket.off('leave_channel').on('leave_channel', async (channel: ChannelEntity) => {
			channel.realname = channel.name;
			channel.name = '';
			if (store.getters.GET_ROOM) {
				await store.dispatch("SET_LIST_USER_CURRENT", await shared.getUserInChan('General'));
				await this.getMessagesInChannel('General');
				const general = store.getters.GET_LIST_CHAN_PUBLIC.find(e => e.realname == 'General');
				store.dispatch("SET_CHAN_CURRENT", general);
				store.dispatch("SET_CHAN", general);
				const tmp = await this.getChanListByMode('public');
				tmp.forEach(e => {
					e.realname = e.name;
					e.name = '';
				})
				await store.dispatch("SET_LIST_CHAN_PUBLIC", tmp);
			}
			else {
				const tmp = await this.getChanListByMode('private');
				tmp.forEach(e => {
					e.realname = e.name;
					e.name = '';
					if (e.mode == 8) {
						e.name = e.realname.substring(e.realname.indexOf('-') + 2);
						if (e.name == store.getters.GET_USER.username)
							e.name = e.realname.substring(0, e.realname.indexOf('-') - 1);
					}
				})
				store.dispatch("SET_LIST_CHAN_PRIVATE", tmp);
				if (tmp.length)
				{
					const chan = store.getters.GET_LIST_CHAN_PRIVATE[0];
					store.dispatch("SET_CHAN_CURRENT", chan);
					store.dispatch("SET_CHAN_PRIVATE", chan);
					await store.dispatch("SET_LIST_USER_CURRENT", await shared.getUserInChan(chan.realname));
					await this.getMessagesInChannel(chan.realname);
				}
				else
				{
					store.dispatch("SET_CHAN_CURRENT", []);
					store.dispatch("SET_CHAN_PRIVATE", []);
					await store.dispatch("SET_LIST_USER_CURRENT", []);
					store.dispatch("SET_LIST_MESSAGES_BY_CHAN", [])
					store.dispatch("SET_LIST_MESSAGES", []);
				}
			}
			this.refresh();
		});
	
		store.state.socket.off('refreshAvatar').on('refreshAvatar', async (username: string) => {
			if (store.getters.GET_USER_TARGET.username == username)
				store.dispatch("SET_IMG_TARGET", await shared.get_avatar(username));
			if (store.getters.GET_USER.username == username)
				store.dispatch("SET_IMG", await shared.get_avatar(username));
	
		});
	
		store.state.socket.off('new_mode').on('new_mode', async (chanName: string, username: string, mode: number) => {
			if (store.getters.GET_CHAN_CURRENT.realname == chanName) {
				await store.dispatch("SET_LIST_USER_CURRENT", await shared.getUserInChan(chanName));
				if (username == store.getters.GET_USER.username)
					store.dispatch("SET_MY_MODE", mode);
	
			}
			if (store.getters.GET_USER_TARGET.username == username)
				store.dispatch("SET_MODE", mode);
	
		});
	
		store.state.socket.off('rcvInvite').on('rcvInvite', (channel_target: ChannelEntity, user_target: UserEntity) => {
			if (this.isBlock(user_target.username))
				return;
			if (store.getters.GET_POPUP == "alert" || store.getters.GET_POPUP == "inv" || store.getters.GET_POPUP == "inv_game" )
				return;
			store.dispatch("SET_CHANNEL_TARGET", channel_target);
			store.dispatch("SET_USER_TARGET_ALERT", user_target);
			this.conf(channel_target);
		});
	
		store.state.socket.off('rcv_inv_game').on('rcv_inv_game', (user_target: UserEntity, game: string) => {
			if (this.isBlock(user_target.username))
				return;
			if (store.getters.GET_POPUP == "alert" || store.getters.GET_POPUP == "inv" || store.getters.GET_POPUP == "inv_game" )
				return;
			store.dispatch("SET_SAVE_POPUP");
			store.dispatch("SET_USER_TARGET_ALERT", user_target);
			store.dispatch("SET_GAME", game);
			store.dispatch("SET_POPUP", store.getters.GET_POPUP);
			this.setPopup('inv_game')
		});
	
		store.state.socket.off('start_game').on('start_game', () => {
			store.dispatch("SET_DUEL", true);
			this.setPopup('');
			this.$router.push('/');
		});
	}

}