import { defineComponent } from "@vue/runtime-core";
import { mapGetters } from "vuex";
import store from '@/store';
import shared from "@/mixins/Mixins";
import PopupProfil from "@/components/popup/Popup_profil.vue";
import Datepicker from 'vue3-date-time-picker';
import 'vue3-date-time-picker/dist/main.css'
import { MemberType } from "@/enums/enums";
import { UserEntity } from "@/interface/interface";
import PopupAlert from "@/components/popup/PopupAlert.vue";

export type Avatar = File | null;

export default defineComponent({
	components: {
		PopupProfil,
		Datepicker,
		PopupAlert,
	},
	data: () => {
		return {
			mdp: '',
			mdp2: '',
			date: null,
			selected_mode: ''
		};
	},
	computed: {
		...mapGetters([
			'GET_USER',
			'GET_POPUP',
			'GET_USER_TARGET',
			'GET_ROOM',
			'GET_CHAN_PRIVATE',
			'GET_CHAN_CURRENT',
			'GET_LIST_USER_GENERAL',
			'GET_LIST_CHANNEL_PUBLIC',
			'GET_CHANNEL_TARGET',
			'GET_MSG_ALERT',
			'GET_MODE',
			'GET_MY_MODE',
			'GET_SAVE_POPUP'
		]),
		isAlert() {
			if (store.getters.GET_POPUP.substring(0, 5) == 'alert')
				return true;
			return false;
		}
	},
	methods: {
		back() {
			this.setPopup('');
			store.dispatch("SET_SAVE_POPUP");
		},

		isNotExist(id: number) {
			return !store.getters.GET_LIST_CHAN_PUBLIC.find(e => e.id == id);
		},
		async active_popup_profil() {
			store.dispatch("SET_POPUP", 'profil');
			store.dispatch("SET_SAVE_POPUP");
		},
		setPopup(value: string): void {
			store.dispatch("SET_POPUP", value);
		},
		setUserTarget(value: UserEntity): void {
			store.dispatch("SET_USER_TARGET", value);
		},
		add_room() {
			if (this.mdp != this.mdp2)
				return;
			if (store.getters.GET_ROOM)
				shared.joinPublic(store.getters.GET_CHANNEL_TARGET.name, this.mdp);
			else
				shared.joinPrivate(store.getters.GET_CHANNEL_TARGET.name);
			store.dispatch("SET_POPUP", '');
			store.dispatch("SET_SAVE_POPUP");
		},
		create_room() {
			if (this.mdp != this.mdp2)
				return;
			if (store.getters.GET_ROOM)
				shared.createPublic(store.getters.GET_CHANNEL_TARGET.name, this.mdp);
			else
				shared.createPrivate(store.getters.GET_CHANNEL_TARGET.name);
			store.dispatch("SET_POPUP", '');
			store.dispatch("SET_SAVE_POPUP");
		},
		addUser() {
			store.state.socket.emit('invite', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_PRIVATE.realname);
			store.dispatch("SET_POPUP", '');
			store.dispatch("SET_SAVE_POPUP");
		},
		response_inv(ret: boolean) {
			store.dispatch("SET_POPUP", store.getters.GET_SAVE_POPUP);
			store.dispatch("SET_SAVE_POPUP");
			store.state.socket.emit('valInvite', ret, store.getters.GET_CHANNEL_TARGET.name, store.getters.GET_USER_TARGET.username);
		},
		response_inv_game(ret: boolean) {
			store.dispatch("SET_POPUP", store.getters.GET_SAVE_POPUP);
			if (store.getters.GET_GAME == 'pong')
				store.state.socket.emit('duel', ret, store.getters.GET_USER_TARGET, store.getters.GET_USER, 0);
			else if (store.getters.GET_GAME == 'star')
				store.state.socket.emit('duel', ret, store.getters.GET_USER_TARGET, store.getters.GET_USER, 1);
		},
		async set_ban() {
			if (this.modeIsSet(store.getters.GET_MODE, 'ban'))
				store.state.socket.emit('unbanUserServer', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname);
			else
				store.state.socket.emit('banUserServer', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname, this.date);
			this.date = null;
		},
		async set_mute() {
			if (this.modeIsSet(store.getters.GET_MODE, "mute"))
				store.state.socket.emit('unmuteUserServer', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname);
			else
				store.state.socket.emit('muteUserServer', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname, this.date);
			this.date = null;
		},
		async set_admin() {
			if (this.modeIsSet(store.getters.GET_MODE, "admin"))
				store.state.socket.emit('unsetAdmin', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname);
			else
				store.state.socket.emit('setAdmin', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname);
			this.date = null;
		},
		async set_date(mode: string) {
			if (store.getters.GET_USER_TARGET.username == store.getters.GET_USER.username ||
				this.modeIsSet(store.getters.GET_MODE, "owner") ||
				((this.modeIsSet(store.getters.GET_MODE, "admin") || mode == 'admin' || mode == 'unadmin') && !this.modeIsSet(store.getters.GET_MY_MODE, "owner")))
				return;
			if ((this.modeIsSet(store.getters.GET_MY_MODE, "owner") || this.modeIsSet(store.getters.GET_MY_MODE, "admin")))
				this.selected_mode = mode;
			if (mode == 'block')
				await this.blockUser(store.getters.GET_USER.id, store.getters.GET_USER_TARGET.id);
			else if (mode == 'unblock')
				await this.unBlockUser(store.getters.GET_USER.id, store.getters.GET_USER_TARGET.id);
		},
		async set_mode() {
			if (this.selected_mode == 'mute' || this.selected_mode == 'unmute')
				this.set_mute();
			else if (this.selected_mode == 'ban' || this.selected_mode == 'unban')
				this.set_ban();
			else if (this.selected_mode == 'admin' || this.selected_mode == 'unadmin')
				this.set_admin();
			this.selected_mode = '';
		},
		modeIsSet(num: number, mode: string): boolean {
			let mode_set: number;
			switch (mode) {
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
		},
		set_pass(): void {
			if (this.mdp == this.mdp2) {
				store.state.socket.emit('passChan', this.mdp, store.getters.GET_CHAN_CURRENT.realname);
				store.dispatch("SET_POPUP", '');
				store.dispatch("SET_SAVE_POPUP");
			}
		},
		add_friend(): void {
			store.state.socket.emit('addFriend', store.getters.GET_USER_TARGET.username);
		},
	},
})