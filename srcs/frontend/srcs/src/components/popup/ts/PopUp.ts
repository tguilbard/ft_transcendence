import { defineComponent } from "@vue/runtime-core";
import { mapGetters } from "vuex";
import store, { UserEntity } from '../../../store';
import shared from "../../../mixins/Mixins";
import PopupProfil from "../Popup_profil.vue";
import Datepicker from 'vue3-date-time-picker';
import 'vue3-date-time-picker/dist/main.css'

export interface UserElement {
  username: string,
   state: string,
   mode: number
}

export interface User {
  username: string,
  tfaActivated: boolean
}

export enum MemberType {
  owner = 1,
  admin = 1 << 1,
  mute = 1 << 2,
  ban = 1 << 3
}

export type Avatar = File | null;
          
export default defineComponent({
components: {
  PopupProfil,
  Datepicker
},
data: () => {
    return {
        mdp: '',
        mdp2: '',
        listUsersPopup: '',
        li: [''],
        owner: 1,
        admin: 1 << 1,
        mute: 1 << 2,
        ban: 1 << 3,
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
        'GET_MY_MODE'
      ]),
      isBlock() {
        return store.getters.GET_LIST_BLOCKED.find(e => e == store.getters.GET_USER_TARGET.username);
      }
  },
  methods: {
    async active_popup_profil()
    {
      store.commit("SET_POPUP", 'profil');
      // store.dispatch("SET_IMG_TARGET", await shared.get_avatar(store.getters.GET_USER_TARGET.username));      
    },
    setPopup(value: string): void {
      store.commit("SET_POPUP", value);
    },
    setUserTarget(value: UserEntity): void {
      store.commit("SET_USER_TARGET", value);
    },
      create_room() {
        if (this.mdp != this.mdp2)
            return;
        if (store.getters.GET_ROOM)
          shared.joinPublic(store.getters.GET_CHANNEL_TARGET.name, this.mdp);
        else
          shared.joinPrivate(store.getters.GET_CHANNEL_TARGET.name);
        store.commit("SET_POPUP", '');
      },
        addUser() {
        store.state.socket.emit('invite', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_PRIVATE.realname);
        store.commit("SET_POPUP", '');
      },
      response_inv(ret: boolean) {
        store.state.socket.emit('valInvite', ret, store.getters.GET_CHANNEL_TARGET.name , store.getters.GET_USER_TARGET.username);
        store.commit("SET_POPUP", '');
      },
      response_inv_game(ret: boolean) {
        store.state.socket.emit('duel', ret, store.getters.GET_USER_TARGET.username);
        store.commit("SET_POPUP", '');
      },
      async set_ban()
      {   
        if (this.modeIsSet(store.getters.GET_MODE, MemberType.ban))
          store.state.socket.emit('unbanUserServer', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname);
        else
          store.state.socket.emit('banUserServer', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname, this.date);
          this.date = null;
      },
      async set_mute()
      {
        if (this.modeIsSet(store.getters.GET_MODE, MemberType.mute))
          store.state.socket.emit('unmuteUserServer', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname);
        else
          store.state.socket.emit('muteUserServer', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname, this.date);
          this.date = null;
      },
      async set_admin()
      {   
        if (this.modeIsSet(store.getters.GET_MODE, MemberType.admin))
          store.state.socket.emit('unsetAdmin', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname);
        else
          store.state.socket.emit('setAdmin', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname);
          this.date = null;
      },
      async set_date(mode: string)
      {
        if (store.getters.GET_USER_TARGET.username == store.getters.GET_USER.username || 
          this.modeIsSet(store.getters.GET_MODE, MemberType.owner) ||
          ((this.modeIsSet(store.getters.GET_MODE, MemberType.admin) || mode == 'admin' || mode == 'unadmin') && !this.modeIsSet(store.getters.GET_MY_MODE, MemberType.owner)))
            return;
        if ((this.modeIsSet(store.getters.GET_MY_MODE, MemberType.owner) || this.modeIsSet(store.getters.GET_MY_MODE, MemberType.admin))) 
          this.selected_mode = mode;
        if (mode == 'block')
        {
          await this.blockUser(store.getters.GET_USER.id, store.getters.GET_USER_TARGET.id);
          store.dispatch("SET_LIST_BLOCKED", await this.getListBlocked());
        }
        else if (mode == 'unblock')
        {
          await this.unBlockUser(store.getters.GET_USER.id, store.getters.GET_USER_TARGET.id);
          store.dispatch("SET_LIST_BLOCKED", await this.getListBlocked());
        }
      },
      async set_mode()
      {
        if (this.selected_mode == 'mute' || this.selected_mode == 'unmute')
          this.set_mute();
        else if (this.selected_mode == 'ban' || this.selected_mode == 'unban')
          this.set_ban();
        else if (this.selected_mode == 'admin' || this.selected_mode == 'unadmin')
          this.set_admin();
        this.selected_mode = '';
      },
      set_pass(): void {
        if (this.mdp == this.mdp2)
        {
          store.state.socket.emit('passChan', this.mdp, store.getters.GET_CHAN_CURRENT.realname);
          store.commit("SET_POPUP", '');
        }
      },
      add_friend(): void {
        store.state.socket.emit('addFriend', store.getters.GET_USER_TARGET.username);
      },
      modeIsSet(num: number, bit_to_check: number): boolean {
        if (num & bit_to_check)
            return true;
        return false;
      },

      async blockUser(id1: number, id2: number) {
        const response = await fetch("http://localhost:3000/users/block/" + id1 + "/" + id2, {
          method: "Post",
          mode: "cors",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Access-Control-Max-Age": "600",
            "Cache-Control": "no-cache",
          },
        });
        if (response.ok)
          return await response.json();
        return [];
      },
    
      async unBlockUser(id1: number, id2: number) {
        const response = await fetch("http://localhost:3000/users/unblock/" + id1 + "/" + id2, {
          method: "Delete",
          mode: "cors",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Access-Control-Max-Age": "600",
            "Cache-Control": "no-cache",
          },
        });
        if (response.ok)
          return await response.json();
        return [];
      }
  },
})