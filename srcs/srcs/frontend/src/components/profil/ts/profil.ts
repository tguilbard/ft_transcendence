import { Options, Vue } from "vue-class-component";
import Menu from "@/components/Menu.vue"; // @ is an alias to /src
import Popup from "@/components/PopUp.vue";
import store from "@/store/index";
import shared from "@/mixins/Mixins";
import { mapGetters } from "vuex";
import { ChannelEntity, UserEntity, Achievements, Message } from "@/interface/interface";

@Options({
	components: {
		Menu,
		Popup,
	},
	data() {
		return {
			log: false,
		};
	},
	computed: {
		...mapGetters([
			"GET_USER",
			"GET_POPUP",
			"GET_USER_TARGET",
			"GET_IMG",
			"GET_LIST_ACHIEVEMENTS",
			"GET_LIST_MATCH",
			"GET_FRIENDS",
			"GET_SAVE_POPUP",
		]),
	},
	methods: {
		setAchievement(value: Achievements): void {
			store.dispatch("SET_ACHIEVEMENT", value);
			store.dispatch("SET_SAVE_POPUP");
			this.setPopup("description2");
		},
		setPopup(value: string): void {
			store.dispatch("SET_POPUP", value);
		},
		setUserTarget(value: UserEntity): void {
			store.dispatch("SET_USER_TARGET", value);
		},
		async logout() {
			store.state.socket.close();
			store.state.sock_init = false;
			store.dispatch("SET_POPUP", '');
			return this.$router.push("/login");
		},
		getImg(event: { target: { files: File[] } }) {
			this.file = event.target.files[0];
			store.dispatch("SET_IMG", URL.createObjectURL(this.file));
		},
		async getListFriends(): Promise<UserEntity[]> {
			const response = await fetch("http://localhost:3000/users/friends", {
				method: "GET",
				mode: "cors",
				credentials: "include",
				headers: {
					Accept: "application/json",
					"Access-Control-Max-Age": "600",
					"Cache-Control": "no-cache",
				},
			});
			if (response.ok) return response.json();
			return [];
		},
		async active_pop_profil(user: UserEntity): Promise<void> {
			if (user.state == "") {
				const myUser = await shared.getUserByUsername(user.username);
				if (myUser.state) user.state = myUser.state;
			}
			store.dispatch("SET_USER_TARGET", user);
			await store.dispatch("SET_IS_FRIEND", await shared.isFriendByUsername());
			store.dispatch("SET_LIST_MATCH_TARGET", await shared.getListMatchs(user.username));
			await store.dispatch(
				"SET_IMG_TARGET",
				await shared.get_avatar(user.username)
			);
			store.dispatch("SET_LIST_ACHIEVEMENTS_TARGET", await shared.getAchievements(user.username));
			this.setPopup('profil')
			store.dispatch("SET_SAVE_POPUP");
		},
		active_modify_profil(): void {
			this.setPopup('modify_profil')
			store.dispatch("SET_SAVE_POPUP");
		},
	},
	async created() {
		if (!await shared.isLogin())
			return this.$router.push("/login");
		if (!store.state.sock_init) await store.commit("SET_SOCKET");
		this.user = await shared.getMyUser();
		if (this.user.state == 'logout')
			this.user.state = 'login';
		store.dispatch("SET_USER", this.user);
		store.dispatch("SET_IMG", await shared.get_avatar(this.user.username));
		store.dispatch("SET_FRIENDS", await this.getListFriends());
		store.dispatch("SET_LIST_MATCH", await shared.getListMatchs(this.user.username));
		store.dispatch(
			"SET_LIST_ACHIEVEMENTS",
			await shared.getAchievements(store.getters.GET_USER.username)
		);
		store.state.socket.off("start_game").on("start_game", () => {
			store.dispatch("SET_DUEL", true);
			this.setPopup('');
			this.$router.push("/");
		});

		store.state.socket.off('rcv_inv_game').on('rcv_inv_game', (user_target: UserEntity, game: string) => {
			if (store.getters.GET_POPUP == "alert" || store.getters.GET_POPUP == "inv" || store.getters.GET_POPUP == "inv_game")
				return;
			store.dispatch("SET_SAVE_POPUP");
			store.dispatch("SET_USER_TARGET", user_target);
			store.dispatch("SET_GAME", game);
			store.dispatch("SET_INV", false);
			store.dispatch("SET_POPUP", store.getters.GET_POPUP);
			this.setPopup('inv_game')
		});

		store.state.socket.off('refresh_user').on('refresh_user', async (chanName: string) => {
			if (chanName == "all" || store.getters.GET_CHAN_CURRENT.realname == chanName) {
				store.dispatch("SET_USER_TARGET", await shared.getUserByUsername(store.getters.GET_USER_TARGET.username));
				store.dispatch("SET_FRIENDS", await this.getListFriends());
				if (store.getters.GET_POPUP)
					store.dispatch("SET_LIST_MATCH_TARGET", await shared.getListMatchs(store.getters.GET_USER_TARGET.username));
				else
					store.dispatch("SET_LIST_MATCH", await shared.getListMatchs(store.getters.GET_USER.username));
			}
		});

		store.state.socket.off('alertMessage').on('alertMessage', async (msg: string) => {
			if (store.getters.GET_POPUP == "alert" || store.getters.GET_POPUP == "inv" || store.getters.GET_POPUP == "inv_game")
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
			return this.$router.push("/chat");
		});

		store.state.socket.off('refresh_friends').on('refresh_friends', async () => {
			store.dispatch("SET_IS_FRIEND", await shared.isFriendByUsername());
			store.dispatch("SET_FRIENDS", await this.getListFriends());
		});

		store.state.socket.off('refreshAvatar').on('refreshAvatar', async (username: string) => {
			if (store.getters.GET_USER_TARGET.username == username)
				store.dispatch("SET_IMG_TARGET", await shared.get_avatar(username));
			if (store.getters.GET_USER.username == username)
				store.dispatch("SET_IMG", await shared.get_avatar(username));
		});

		store.state.socket.off('changeUsername').on("changeUsername",
			async (payload: [{ oldname: string, newname: string, oldchan: string, newchan: string }]) => {
				payload.forEach(e => {
					let chan_tmp = store.getters.GET_CHAN_CURRENT;
					if (chan_tmp.realname == e.oldchan) {
						chan_tmp.realname = e.newchan;
						if (store.getters.GET_USER.username != e.newname)
							chan_tmp.name = e.newname;
						store.dispatch("SET_CHAN_CURRENT", chan_tmp);
					}
					chan_tmp = store.getters.GET_CHAN_PRIVATE;
					if (chan_tmp.realname == e.oldchan) {
						chan_tmp.realname = e.newchan;
						if (store.getters.GET_USER.username != e.newname)
							chan_tmp.name = e.newname;
					}
				})
				const user = await shared.getMyUser();
				store.dispatch("SET_USER", user);
				store.dispatch("SET_IMG", await shared.get_avatar(user.username));
				store.dispatch("SET_FRIENDS", await this.getListFriends());
				store.dispatch("SET_LIST_MATCH", await shared.getListMatchs(user.username));
				store.dispatch(
					"SET_LIST_ACHIEVEMENTS",
					await shared.getAchievements(store.getters.GET_USER.username)
				);

				let user_target = store.getters.GET_USER_TARGET;
				if (user_target && user_target.username == payload[0].oldname) {
					user_target = await shared.getUserByUsername(payload[0].newname)
					store.dispatch("SET_USER_TARGET", user_target);
					await store.dispatch("SET_IS_FRIEND", await shared.isFriendByUsername());
					store.dispatch("SET_LIST_MATCH_TARGET", await shared.getListMatchs(user_target.username));
					await store.dispatch(
						"SET_IMG_TARGET",
						await shared.get_avatar(user_target.username)
					);
				}
			});

		store.state.socket.off('msgToClientPrivate');

		store.state.socket.off("refreshAcheivements").on("refreshAcheivements", async (username: string) => {
			if (store.getters.GET_USER_TARGET.username == username) {
				store.dispatch(
					"SET_LIST_ACHIEVEMENTS_TARGET",
					await shared.getAchievements(username)
				);
			}
			if (store.getters.GET_USER.username == username) {
				store.dispatch(
					"SET_LIST_ACHIEVEMENTS",
					await shared.getAchievements(username)
				);
			}
		});

		store.state.socket.off('rcvInvite').on('rcvInvite', (channel_target: ChannelEntity, user_target: UserEntity) => {
			if (store.getters.GET_POPUP == "alert" || store.getters.GET_POPUP == "inv" || store.getters.GET_POPUP == "inv_game")
				return;
			store.dispatch("SET_CHANNEL_TARGET", channel_target);
			store.dispatch("SET_USER_TARGET", user_target);
			if (typeof channel_target !== 'undefined') {
				store.dispatch("SET_SAVE_POPUP");
				store.dispatch("SET_POPUP", 'inv');
			}
		});

		this.log = true;
	},
})
export default class Profil extends Vue { }