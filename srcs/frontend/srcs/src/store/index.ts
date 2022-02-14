import { createStore } from 'vuex'
import { io } from 'socket.io-client';

export interface ChanPrivate {
  name: string, realname: string
}

export interface UserElement {
  name: string,
  state: string,
   mode: number
}

export interface Chan {
  name: string,
  mode: number | string
}

export interface Achievements {
  id : number,
  name: string,
  description: string,
  imageUnlockName: string,
  imageLockName: string,
  lock: boolean
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

export default createStore({
  state: {
    socket: io(),
    sock_init: false,
    listUsersCurrent:[ { name: '', state: '', mode: 0 } as UserElement ],
    username: '',
    channel: "General",
    channelPrivate: { name: '', realname: '' } as ChanPrivate,
    channelCurrent: { name: '', realname: 'General' } as ChanPrivate,
    channelList: { "General": [] },
    room: true,
    popup: '',
    user_target: {username: '', state: ''},
    listUsersGeneral: [{ username: '', state: '', mode: 0}],
    listChannelPublic: [{ name: '', mode: 0 }],
    channel_target: { name: '', mode: 0 },
    listChannel: [{ name: '', mode: 0 } as Chan],
    chanPrivate: [{ name: '', mode: '' } as Chan],
    messages: [{ username: '', message: '', time: '', colored: '' } as unknown as Message],
    msg_alert: '',
    mode: 0,
    my_mode: 0,
    isFriend: false,
    list_achievements: [{ id: 0, name: '', description: '', imageUnlockName: '',  imageLockName: '', lock: true} as Achievements],
    srcImg: '',
    achievement: { id: 0, name: '', description: '', imageUnlockName: '',  imageLockName: '', lock: true} as Achievements
  },
  mutations: {
    SET_IMG(state, value: string) {
      state.srcImg = value;
    },
    SET_ACHIEVEMENT(state, value: Achievements) {
      state.achievement = value;
    },
    SET_LIST_ACHIEVEMENTS(state, value: Achievements[]) {
      state.list_achievements = value;
    },
    SET_IS_FRIEND(state, value: boolean) {
      state.isFriend = value;
    },
    SET_MY_MODE(state, value: number) {
      state.my_mode = value;
    },
    SET_MODE(state, value: number) {
        state.mode = value;
    },
    SET_MSG_ALERT(state, value: string) {
      state.msg_alert = value;
    },
    SET_LIST_MESSAGES(state, value: Message[]) { 
      state.messages = value;
    },
    SET_LIST_CHAN_PRIVATE(state, value: Chan[]) { 
      state.chanPrivate = value;
    },
    SET_LIST_CHAN_PUBLIC(state, value: Chan[]) { 
      state.listChannel = value;
    },
    SET_CHANNEL_TARGET(state, value: {name: string, mode: number}) {
      state.channel_target = value;
    },
    SET_LIST_USER_GENERAL(state, value: [{ username: string, state: string, mode: number}]) {
      state.listUsersGeneral = value;
    },
    SET_LIST_CHANNEL_PUBLIC(state, value: [{ name: string, mode: number}]) {
      state.listChannelPublic = value;
    },
    SET_POPUP(state, value: string) {
      state.popup = value;
    },
    SET_SOCKET(state) {
      state.sock_init = true;
      state.socket = io('http://localhost:3000', { transports: ['websocket', 'polling', 'flashsocket'] });
    },
    SET_LIST_USER_CURRENT(state, list: UserElement[]) {
      state.listUsersCurrent = list;
    },
    SET_USERNAME(state, username: string) {
      state.username = username;
    },
    SET_ROOM(state, room: boolean) {
      state.room = room;
    },
    SET_CHAN_PRIVATE(state, para: {type: string, value: string}): void {
      if (para.type == "name")
        state.channelPrivate.name = para.value;
      else if (para.type == "realname")
        state.channelPrivate.realname = para.value;
    },
    SET_CHAN_CURRENT(state, para: {type: string, value: string}): void {
      if (para.type == "name")
        state.channelCurrent.name = para.value;
      else if (para.type == "realname")
        state.channelCurrent.realname = para.value;
    },
    SET_CHAN(state, chan) {
      state.channel = chan;
    },
    SET_USER_TARGET(state, value: {username: string, state: string}): void {
      state.user_target.username = value.username;
      state.user_target.state = value.state;
    },
  },
  getters: {
    GET_SCOKET_INIT(state) {
      return state.sock_init;
   },
    GET_CHAN_PRIVATE(state) {
       return state.channelPrivate;
    },
    GET_USER_TARGET(state) {
      return state.user_target
    },
    GET_CHAN_CURRENT(state) {
        return state.channelCurrent;
    },
    GET_CHAN(state) {
      return state.channel;
    },
    GET_USERNAME(state) {
      return state.username;
    },
    GET_POPUP(state) {
      return state.popup;
    },
    GET_ROOM(state) {
      return state.room;
    },
    GET_LIST_USER_GENERAL(state) {
      return state.listUsersGeneral;
    },
    GET_LIST_CHANNEL_PUBLIC(state) {
      return state.listChannelPublic;
    },
    GET_CHANNEL_TARGET(state) {
      return state.channel_target;
    },
    GET_LIST_CHAN_PUBLIC(state) {
      return state.listChannel;
    },
    GET_LIST_CHAN_PRIVATE(state) {
      return state.chanPrivate;
    },
    GET_LIST_USER_CURRENT(state) {
      return state.listUsersCurrent;
    },
    GET_LIST_MESSAGES(state) {
      return state.messages;
    },
    GET_MSG_ALERT(state) {
      return state.msg_alert;
    },
    GET_MODE(state) {
      return state.mode;
    },
    GET_MY_MODE(state) {
      return state.my_mode;
    },
    GET_IS_FRIEND(state): boolean {
      return state.isFriend;
    },
    GET_LIST_ACHIEVEMENTS(state) {
      return state.list_achievements;
    },
    GET_ACHIEVEMENT(state) {
      return state.achievement;
    },
    GET_IMG(state) {
      return state.srcImg;
    },
  },
  actions: {
    SET_POPUP(context, value: string) {
      context.commit("SET_POPUP", value)
    },
    SET_USER_TARGET(context, value: {username: string, state: string}): void {
      context.commit("SET_USER_TARGET", value);
    },
    SET_ROOM(context, value: string): void {
      context.commit("SET_ROOM", value);
    },
    SET_CHAN(context, value: string): void {
      context.commit("SET_CHAN", value);
    },
    SET_CHAN_PRIVATE(context, value: {type: string, value: string}): void {
      context.commit("SET_CHAN_PRIVATE", value);
    },
    SET_CHAN_CURRENT(context, value: {type: string, value: string}): void {
      context.commit('SET_CHAN_CURRENT', value);
    },
    SET_LIST_USER_GENERAL(context, value: [{ username: string, state: string, mode: number}]) {
      context.commit("SET_LIST_USER_GENERAL", value);
    },
    SET_LIST_CHANNEL_PUBLIC(context, value: [{ name: string, mode: number}]) {
      context.commit("SET_LIST_CHANNEL_PUBLIC", value);
    },
    SET_CHANNEL_TARGET(context, value: { name: string, mode: number}) {
      context.commit("SET_CHANNEL_TARGET", value);
    },
    SET_LIST_CHAN_PUBLIC(context, value: Chan[]) {
      context.dispatch("SET_LIST_CHAN_PUBLIC", value);
    },
    SET_LIST_CHAN_PRIVATE(context, value: Chan[]) { 
      context.commit("SET_LIST_CHAN_PRIVATE", value);
    },
    SET_LIST_USER_CURRENT(context, list: UserElement[]) {
      context.commit("SET_LIST_USER_CURRENT", list);
    },
    SET_LIST_MESSAGES(context, value: Message[]) { 
      context.commit("SET_LIST_MESSAGES", value);
    },
    SET_MSG_ALERT(context, value: string) {
      context.commit('SET_MSG_ALERT', value);
    },
    SET_MODE(context, value: number) {
      context.commit('SET_MODE', value);
    },
    SET_MY_MODE(context, value: number) {
      context.commit('SET_MY_MODE', value);
    },
    SET_IS_FRIEND(context, value: boolean) {
      context.commit("SET_IS_FRIEND", value);
    },
    SET_LIST_ACHIEVEMENTS(context, value: Achievements[]) {
      context.commit("SET_LIST_ACHIEVEMENTS", value);
    },
    SET_ACHIEVEMENT(context, value: Achievements) {
      context.commit("SET_ACHIEVEMENT", value);
    },
    SET_USERNAME(context, username: string) {
      context.commit("SET_USERNAME", username);
    },
    SET_IMG(context, value: string) {
      context.commit("SET_IMG", value);
    },
  },
  modules: {
  }
})