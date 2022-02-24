import { createStore } from 'vuex'
import { io } from 'socket.io-client';

export interface ChanPrivate {
  name: string, realname: string
}

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

export default createStore({
  state: {
    socket: io(),
    sock_init: false,
    listUsersCurrent:[ {} as UserEntity ],
    user: {} as UserEntity,
    channel: {} as ChannelEntity,
    channelPrivate: {} as ChannelEntity,
    channelCurrent: { name: '', realname: 'General' } as ChannelEntity,
    channelList: { "General": [] },
    room: true,
    popup: '',
    user_target: {} as UserEntity,
    listUsersGeneral: [{} as UserEntity],
    listChannelPublic: [{} as ChannelEntity],
    channel_target: {} as ChannelEntity,
    listChannel: [{} as ChannelEntity],
    chanPrivate: [{} as ChannelEntity],
    messages: [{} as unknown as Message],
    msg_alert: '',
    mode: 0,
    my_mode: 0,
    isFriend: false,
    list_achievements: [{} as Achievements],
    srcImg: '',
    srcImgTarget: '',
    achievement: {} as Achievements,
    duel: false,
    leaderBoard: [{} as UserEntity],
    listMessages: {} as MessagesList,
    listMatchs: {} as Match[],
    listMatchsTarget: {} as Match[],
    friends: {} as UserEntity[]
  },
  mutations: {
    SET_FRIENDS(state, value: UserEntity[]) {
      state.friends = value;
    },
    SET_LIST_MATCH(state, value: Match[] )
    {
      state.listMatchs = value;
    },
    SET_LIST_MATCH_TARGET(state, value: Match[] )
    {
      state.listMatchsTarget = value;
    },
    SET_LIST_MESSAGES_BY_CHAN(state, value: MessagesList )
    {
      state.listMessages = value;
    },
    SET_LEADER_BOARD(state, value: [])
    {
      state.leaderBoard = value;
    },
    SET_DUEL(state, value: boolean) {
      state.duel = value;
    },
    SET_IMG(state, value: string) {
      state.srcImg = value;
    },
    SET_IMG_TARGET(state, value: string) {
      state.srcImgTarget = value;
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
    SET_LIST_CHAN_PRIVATE(state, value: ChannelEntity[]) { 
      state.chanPrivate = value;
    },
    SET_LIST_CHAN_PUBLIC(state, value: ChannelEntity[]) { 
      state.listChannel = value;
    },
    SET_CHANNEL_TARGET(state, value: ChannelEntity) {
      state.channel_target = value;
    },
    SET_LIST_USER_GENERAL(state, value: UserEntity[]) {
      state.listUsersGeneral = value;
    },
    SET_LIST_CHANNEL_PUBLIC(state, value: ChannelEntity[]) {
      state.listChannelPublic = value;
    },
    SET_POPUP(state, value: string) {
      state.popup = value;
    },
    SET_SOCKET(state) {
      state.sock_init = true;
      state.socket = io('http://localhost:3000', { transports: ['websocket', 'polling', 'flashsocket'] });
    },
    SET_LIST_USER_CURRENT(state, list: UserEntity[]) {
      state.listUsersCurrent = list;
    },
    SET_USER(state, user: UserEntity) {
      state.user = user;
    },
    SET_ROOM(state, room: boolean) {
      state.room = room;
    },
    SET_CHAN_PRIVATE(state, chan: ChannelEntity): void {
      state.channelPrivate = chan;
    },
    SET_CHAN_CURRENT(state, channel: ChannelEntity): void {
     state.channelCurrent = channel
    },
    SET_CHAN(state, chan: ChannelEntity) {
      state.channel = chan;
    },
    SET_USER_TARGET(state, value: UserEntity): void {
      state.user_target = value;
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
    GET_USER(state) {
      return state.user;
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
    GET_IMG_TARGET(state) {
      return state.srcImgTarget;
    },
    GET_DUEL(state) {
      return state.duel;
    },
    GET_LEADER_BOARD(state)
    {
      return state.leaderBoard;
    },
    GET_LIST_MESSAGES_BY_CHAN(state) {
      return state.listMessages
    },
    GET_LIST_MATCH(state) {
      return state.listMatchs;
    },
    GET_LIST_MATCH_TARGET(state) {
      return state.listMatchsTarget;
    },
    GET_FRIENDS(state) {
      return state.friends;
    }
  },
  actions: {
    SET_SOCKET(context) {
      context.commit("SET_SOCKET");
    },
    SET_POPUP(context, value: string) {
      context.commit("SET_POPUP", value)
    },
    SET_USER_TARGET(context, value: UserEntity): void {
      context.commit("SET_USER_TARGET", value);
    },
    SET_ROOM(context, value: string): void {
      context.commit("SET_ROOM", value);
    },
    SET_CHAN(context, value: ChannelEntity): void {
      context.commit("SET_CHAN", value);
    },
    SET_CHAN_PRIVATE(context, value: ChannelEntity): void {
      context.commit("SET_CHAN_PRIVATE", value);
    },
    SET_CHAN_CURRENT(context, value: ChannelEntity): void {
      context.commit('SET_CHAN_CURRENT', value);
    },
    SET_LIST_USER_GENERAL(context, value: UserEntity[]) {
      context.commit("SET_LIST_USER_GENERAL", value);
    },
    SET_LIST_CHANNEL_PUBLIC(context, value: ChannelEntity[]) {
      context.commit("SET_LIST_CHANNEL_PUBLIC", value);
    },
    SET_CHANNEL_TARGET(context, value: ChannelEntity) {
      context.commit("SET_CHANNEL_TARGET", value);
    },
    SET_LIST_CHAN_PUBLIC(context, value: ChannelEntity[]) {
      context.commit("SET_LIST_CHAN_PUBLIC", value);
    },
    SET_LIST_CHAN_PRIVATE(context, value: ChannelEntity[]) { 
      context.commit("SET_LIST_CHAN_PRIVATE", value);
    },
    SET_LIST_USER_CURRENT(context, list: UserEntity[]) {
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
    SET_USER(context, user: UserEntity) {
      context.commit("SET_USER", user);
    },
    SET_IMG(context, value: string) {
      context.commit("SET_IMG", value);
    },
    SET_IMG_TARGET(context, value: string) {
      context.commit("SET_IMG_TARGET", value);
    },
    SET_DUEL(context, value: boolean) {
      context.commit("SET_DUEL", value);
    },
    SET_LEADER_BOARD(context, value: [])
    {
      context.commit("SET_LEADER_BOARD", value);
    },
    SET_LIST_MESSAGES_BY_CHAN(context, value: MessagesList )
    {
      context.commit("SET_LIST_MESSAGES_BY_CHAN", value);
    },
    SET_LIST_MATCH(context, value: Match[] )
    {
      context.commit("SET_LIST_MATCH", value);
    },
    SET_LIST_MATCH_TARGET(context, value: Match[] )
    {
      context.commit("SET_LIST_MATCH_TARGET", value);
    },
    SET_FRIENDS(context, value: UserEntity[]) {
      context.commit("SET_FRIENDS", value);
    },
  },
  modules: {
  }
})