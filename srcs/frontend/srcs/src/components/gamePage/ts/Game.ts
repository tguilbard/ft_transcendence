import { Options, Vue } from "vue-class-component";
import Menu from "@/components/Menu.vue"; // @ is an alias to /src
import { ChannelEntity, Message, UserEntity } from "@/interface/interface";
import shared from "@/mixins/Mixins";
import Pong from "@/components/game/Pong.vue";
import { mapGetters } from "vuex";
import PopUp from "@/components/PopUp.vue";
import store from "@/store";

@Options({
	components: {
		Menu,
		Pong,
		PopUp,
	},

	async created() {
		if (!(await shared.isLogin())) return this.$router.push("login");
		if (!store.state.sock_init) store.commit("SET_SOCKET");

		const user = await shared.getMyUser();


		if (user.state == 'in match')
			await this.active_game();

		store.dispatch("SET_USER", user);
		await store.dispatch(
			"SET_LIST_USER_GENERAL",
			await shared.getUserInChan("General")
		);
		store.dispatch(
			"SET_LIST_ACHIEVEMENTS",
			await shared.getAchievements(store.getters.GET_USER.username)
		);
		store.dispatch("SET_LEADER_BOARD", await shared.getLeaderBoard());
		if (store.getters.GET_DUEL) this.active_game();

		store.state.socket.off("start_game").on("start_game", () => {
			this.active_game();
		});

		store.state.socket.off('rcv_inv_game').on('rcv_inv_game', (user_target: UserEntity, game: string) => {
			store.dispatch("SET_SAVE_POPUP");
			store.dispatch("SET_USER_TARGET", user_target);
			store.dispatch("SET_GAME", game);
			store.dispatch("SET_INV", false);
			store.dispatch("SET_POPUP", 'alert' + store.getters.GET_POPUP);
			this.setPopup('inv_game')
		});

		store.state.socket
			.off("refresh_friends")
			.on("refresh_friends", async () => {
				store.dispatch("SET_IS_FRIEND", await shared.isFriendByUsername());
			});

		store.state.socket.off('refreshAvatar').on('refreshAvatar', async (username: string) => {
			if (store.getters.GET_USER_TARGET.username == username)
				store.dispatch("SET_IMG_TARGET", await shared.get_avatar(username));
			if (store.getters.GET_USER.username == username)
				store.dispatch("SET_IMG", await shared.get_avatar(username));
		});

		store.state.socket
			.off("goMsg")
			.on("goMsg", async (channel: ChannelEntity) => {
				channel.realname = channel.name;
				channel.name = "";
				store.dispatch("SET_ROOM", false);
				channel.name = channel.realname.substring(
					channel.realname.indexOf("-") + 2
				);
				if (channel.name == store.getters.GET_USER.username)
					channel.name = channel.realname.substring(
						0,
						channel.realname.indexOf("-") - 1
					);
				store.dispatch("SET_CHAN_PRIVATE", channel);
				store.dispatch("SET_CHAN_CURRENT", channel);
				store.dispatch("SET_POPUP", "");
				store.dispatch("SET_SAVE_POPUP");

				return this.$router.push("/chat");
			});

		store.state.socket
			.off("alertMessage")
			.on("alertMessage", async (msg: string) => {
				store.dispatch("SET_SAVE_POPUP");
				store.dispatch("SET_MSG_ALERT", msg);
				store.dispatch("SET_POPUP", 'alert' + store.getters.GET_POPUP);
			});

		store.state.socket
			.off("refresh_user")
			.on("refresh_user", async (chanName: string) => {
				if (
					chanName == "all" ||
					store.getters.GET_CHAN_CURRENT.realname == chanName
				) {
					await store.dispatch(
						"SET_LEADER_BOARD",
						await shared.getLeaderBoard()
					);
					store.dispatch(
						"SET_USER_TARGET",
						await shared.getUserByUsername(
							store.getters.GET_USER_TARGET.username
						)
					);
					if (store.getters.GET_POPUP)
						store.dispatch(
							"SET_LIST_MATCH_TARGET",
							await shared.getListMatchs(store.getters.GET_USER_TARGET.username)
						);
				}
			});

		store.state.socket
			.off("msgToClientPrivate")
			.on("msgToClientPrivate", (newMsg: Message, channel: ChannelEntity) => {
				if (!store.getters.GET_DUEL) {
					store.dispatch(
						"SET_MSG_ALERT",
						newMsg.username + " send to you a message private"
					);
					store.dispatch("SET_POPUP", "alert");
					store.dispatch("SET_SAVE_POPUP");
				}
			});

		store.state.socket.off("changeUsername").on(
			"changeUsername",
			async (
				payload: [
					{
						oldname: string;
						newname: string;
						oldchan: string;
						newchan: string;
					}
				]
			) => {
				store.dispatch("SET_USER", await shared.getMyUser());
				let user_target = store.getters.GET_USER_TARGET;
				if (user_target && user_target.username == payload[0].oldname) {
					user_target = await shared.getUserByUsername(payload[0].newname);
					store.dispatch("SET_USER_TARGET", user_target);
					store.dispatch(
						"SET_LIST_MATCH_TARGET",
						await shared.getListMatchs(user_target.username)
					);
					await store.dispatch(
						"SET_IMG_TARGET",
						await shared.get_avatar(user_target.username)
					);
				}
				await store.dispatch("SET_LEADER_BOARD", await shared.getLeaderBoard());
			}
		);
	},
	computed: {
		...mapGetters([
			"GET_LIST_USER_GENERAL",
			"GET_LEADER_BOARD",
			"GET_USER",
			"GET_POPUP",
		]),
		getRoute() {
			return this.$route.name;
		},
	},
	methods: {


		async submit() {
			const response = await fetch("http://localhost:3000/users/update", {
				method: "PATCH",
				mode: "cors",
				credentials: "include",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					"Access-Control-Max-Age": "600",
					"Cache-Control": "no-cache",
				},
				body: JSON.stringify({
					state: 'in game',
				}),
			});
			if (response.ok) {
				return null;
			}
			return await response.json();
		},


		setPopup(value: string): void {
			store.dispatch("SET_POPUP", value);
		},
		async active_pop_profil(user: UserEntity): Promise<void> {
			store.dispatch("SET_USER_TARGET", user);
			store.dispatch(
				"SET_LIST_MATCH_TARGET",
				await shared.getListMatchs(user.username)
			);
			await store.dispatch("SET_IS_FRIEND", await shared.isFriendByUsername());
			await store.dispatch(
				"SET_IMG_TARGET",
				await shared.get_avatar(user.username)
			);
			store.dispatch(
				"SET_LIST_ACHIEVEMENTS_TARGET",
				await shared.getAchievements(user.username)
			);
			store.commit("SET_POPUP", "profil");
		},
		active_game() {
			let check = document.getElementById("grid");
			if (check !== null) check.style.display = "none";
			check = document.getElementById("PongBorder");
			if (check !== null) check.style.setProperty("display", "block");
			this.setPopup('');
			store.dispatch("SET_INV", false);
		},
	},
})
export default class Home extends Vue { }