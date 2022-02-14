import { defineComponent } from "@vue/runtime-core";
import { mapGetters } from "vuex";
import store from '../../../store';
import shared from "../../../mixins/Mixins";
import PopupProfil from "../../popup/Popup_profil.vue"

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
  PopupProfil
},
props: {
    set_block: { type: Function } || null,
    resp_inv: { type: Boolean },
    blocked: { type: Array },
    block: {type: Boolean},
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
        ban: 1 << 3
    };
  },
  computed: {
      ...mapGetters([
        'GET_USERNAME',
        'GET_POPUP',
        'GET_USER_TARGET',
        'GET_ROOM',
        'GET_CHAN_PRIVATE',
        'GET_CHAN_CURRENT',
        'GET_LIST_USER_GENERAL',
        'GET_LIST_CHANNEL_PUBLIC',
        'GET_CHANNEL_TARGET',
        'GET_MSG_ALERT',
        'GET_MODE'
      ]),
  },
  methods: {

    setPopup(value: string): void {
      store.commit("SET_POPUP", value);
    },
    setUserTarget(value: {username: string, state: string}): void {
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
      async set_ban()
      {   
        if (this.modeIsSet(store.getters.GET_MODE, MemberType.ban))
          store.state.socket.emit('unbanUserServer', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname);
        else
          store.state.socket.emit('banUserServer', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname);
      },
      async set_mute()
      {
        if (this.modeIsSet(store.getters.GET_MODE, MemberType.mute))
          store.state.socket.emit('unmuteUserServer', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname);
        else
          store.state.socket.emit('muteUserServer', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname);
      },
      async set_admin()
      {   
        if (this.modeIsSet(store.getters.GET_MODE, MemberType.admin))
          store.state.socket.emit('unsetAdmin', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname);
        else
          store.state.socket.emit('setAdmin', store.getters.GET_USER_TARGET.username, store.getters.GET_CHAN_CURRENT.realname);
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
      }
  },
})