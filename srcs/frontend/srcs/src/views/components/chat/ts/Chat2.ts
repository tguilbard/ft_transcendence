import { io } from 'socket.io-client';
import { Options, Vue } from 'vue-class-component';
import ChanBut from '../ChanBut.vue';
import CryptoJS from 'crypto-js';
import Menu from "../../Menu.vue"; // @ is an alias to /src
import PopUp from '../../PopUp.vue'
import { PatchFlagNames } from '@vue/shared';
import store from '../../../store';
import { defineComponent } from "@vue/runtime-core";

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

  getTime() : string {
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

// @Options({
//   components: {
//     ChanBut,
//     Menu,
//     PopUp
//   },
// })
// @Options({
//   components: {
//     ChanBut,
//     Menu,
//     PopUp
//   },
export default defineComponent({
  data: () => {
    return {
      chan: [],
      chanPrivate: [{ name: '', key: '' }],
      blocked: [],
      username: "",
      inputMsg: '',
      messages: [],
      channel: "General",
      channelPrivate: { name: '', realname: '' },
      channelCurrent: { name: '', realname: 'General' },
      channelList: { "General": [] },
      colored: false,
      room: true,
      listUsersCurrent: [],
      listUsersGeneral: [],
      listChannelPublic: [],
    
      block_popup: false,
      block_popup_add: false,
      block_popup_inv: false,
      popup_alert: false,
      resp_inv: false,
      name: "",
      user_target: "",
      block_popup_profil: false,
      ban: false,
      mute: false,
      block: false,
      mod: "",
      msg_alert: "",
      li: Object as () => { li: Array<string> },
      li2: Array<string> = []
    };
  },
  methods: {
    async initClient() {
      alert("je suis dans initClient");
      alert("store.state.username = " + store.state.username);
      await this.getMessagesInChannel(this.channelCurrent.realname);
      this.chan = await this.getChanListByMode('public');
      this.chanPrivate = await this.getChanListByMode('private');
      
      this.chanPrivate.forEach(e => {
        if (e.key == 8)
        {
          e.key = e.name.substring(e.name.indexOf('-') + 2);
          if (e.key == store.state.username)
            e.key = e.name.substring(0, e.name.indexOf('-') - 1);
        }
        else
          e.key = '';
      })
      // alert(store.state.username);
      // this.chanPrivate.forEach(e => {
      //  alert(e.name + " = " + e.key);
      // })
      if (!this.channelPrivate.realname && this.chanPrivate.length) {
        // this.channelPrivate.name = this.chanPrivate[0].name;
        this.channelPrivate.realname = this.chanPrivate[0].name;
        if (typeof this.chanPrivate[0].key == "string")
          this.channelPrivate.name = this.chanPrivate[0].key;
      }
      if (this.channelCurrent.name)
        this.listUsersCurrent = await this.getUserInChan(this.channelCurrent.name);
      else
        this.listUsersCurrent = await this.getUserInChan(this.channelCurrent.realname);
    },

    async getListChannelPublic() {
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
        return await response.json();
      return false;
    },
  
    async getMessagesInChannel(chanName: string) {
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
        this.channelList[this.channelCurrent.realname] = resp;
        this.messages = resp;
      }
    },
  
    async getChanListByMode(chanMode: string) {
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
        return await response.json();
      return false;
    },
  
    async isAccess(p_path: string): Promise<boolean> {
      const response = await fetch("http://localhost:3000/access/" + p_path, {
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
        return (await response.json()).log
      return false;
    },
  
    async getUserInChan(chanName: string) {
      const response = await fetch("http://localhost:3000/userInChan/" + chanName, {
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
        return await response.json();
      return false;
    },
  
    postMSG(e: { preventDefault: () => void; target: { value: string; }; }): false | undefined {
      e.preventDefault();
  
      const msg = this.inputMsg;
  
      msg.trim();
  
      if (!msg) {
        return false;
      }
  
      //upgrade parser
      if (msg.substring(0, 7) === "/block ") {
        if (this.blocked.indexOf(msg.substring(7)) === -1) {
          this.blocked.push(msg.substring(7));
        }
      }
      else if (msg.substring(0, 9) === "/unblock ") {
        const index: number = this.blocked.indexOf(msg.substring(9));
        if (index != -1)
          this.blocked.splice(index, 1);
      }
      else if (msg.substring(0, 6) === "/mute ") {
        const name: string = msg.substring(6);
        store.state.socket.emit('muteUserServer', name, this.channel);
      }
      else if (msg.substring(0, 8) === "/unmute ") {
        const name: string = msg.substring(8);
        store.state.socket.emit('unmuteUserServer', name, this.channel);
      }
      else if (msg.substring(0, 5) === "/ban ") {
        const name: string = msg.substring(5);
        store.state.socket.emit('banUserServer', name, this.channel);
      }
      else if (msg.substring(0, 7) === "/unban ") {
        const name: string = msg.substring(7);
        store.state.socket.emit('unbanUserServer', name, this.channel);
      }
      else if (msg.substring(0, 6) === "/join ") {
        const data = msg.split(" ", 3);
        this.joinPublic(data[1], data[2]);
      }
      else if (msg.substring(0, 4) === "/pm ") {
        this.joinPrivateMessage(msg.substring(4));
      }
      else if (msg.substring(0, 4) === "/cp ") {
        this.joinPrivate(msg.substring(4));
      }
      else if (msg.substring(0, 5) === "/inv ") {
        store.state.socket.emit('invite', msg.substring(5), this.channelPrivate.realname);
      }
      else if (msg.substring(0, 7) === "/admin ") {
        store.state.socket.emit('setAdmin', msg.substring(7), this.channel);
      }
      else if (msg.substring(0, 8) === "/uadmin ") {
        store.state.socket.emit('unsetAdmin', msg.substring(8), this.channel);
      }
      else if (msg.substring(0, 5) === "/mod ") {
        store.state.socket.emit('displayMods', msg.substring(5), this.channel);
      }
      else if (msg.substring(0, 6) === "/pass ") {
        const pass = msg.substring(6).replace(/\s/g, "");
        store.state.socket.emit('passChan', pass, this.channel);
      }
      else {
        const newMsg = new Message(store.state.username, msg);
        if (this.room) {
          store.state.socket.emit('msgToServer', newMsg, this.channel);
        }
        else {
            store.state.socket.emit('msgToServerPrivate', newMsg, this.channelPrivate.realname);
        }
      }
  
      this.inputMsg = '';
    },
  
    async active_pop_add(): Promise<void> {
      this.block_popup_add = true;
      this.listUsersGeneral = await this.getUserInChan("General");
      this.listChannelPublic = await this.getListChannelPublic();
    },
  
    async active_pop_profil(user: string): Promise<void> {
      this.user_target = user;
      const index: number = this.blocked.indexOf(user);
      if (index != -1)
        this.block = true;
      else
        this.block = false;
      this.block_popup_profil = true;
    },
  
    async changeChannel(chan: { name: string, key: number | string }): Promise<void> {
      // e.preventDefault();
      this.channelCurrent.realname = chan.name;
      if (typeof chan.key == "string")
        this.channelCurrent.name = chan.key;
      if (this.room)
        this.channel = this.channelCurrent.realname;
      else
      {
        this.channelPrivate.name = this.channelCurrent.name;
        this.channelPrivate.realname = this.channelCurrent.realname;
      }
      await this.getMessagesInChannel(this.channelCurrent.realname);
  
      this.listUsersCurrent = await this.getUserInChan(this.channelCurrent.realname);
    },
  
    async changeRoom(room: boolean): Promise<void> {
      this.room = room;
      if (this.room)
      {
        this.channelCurrent.realname = this.channel;
        this.channelCurrent.name = '';
      }
      else
      {
        this.channelCurrent.name = this.channelPrivate.name;
        this.channelCurrent.realname = this.channelPrivate.realname;
  
      }
      this.listUsersCurrent = await this.getUserInChan(this.channelCurrent.realname);
      await this.getMessagesInChannel(this.channelCurrent.realname);
    },

    async conf(channel: string): Promise<void> {
      if (typeof channel !== 'undefined') {
        this.channelCurrent.realname = channel;
        this.channelCurrent.name = '';
        this.block_popup_inv = true;
        // const msg = "You are invited on " + channel;
      }
    },
  
    async response_inv(ret: boolean): Promise<void> {
      store.state.socket.emit('valInvite', ret, this.channelPrivate.realname);
      this.block_popup_inv = false;
    },
  
    async addUser(): Promise<void> {
      await store.state.socket.emit('invite', this.name, this.channelPrivate.realname);
      this.block_popup_add = false;
    },
  
    outputMessage(message: Message, channel: string): void {
      const tab_message = this.channelList[channel];
      if (tab_message && tab_message.length)
        this.colored = tab_message[tab_message.length - 1].colored;
      if (tab_message.length && tab_message[tab_message.length - 1].username != message.username) {
        if (this.colored)
          this.colored = false;
        else
          this.colored = true;
      }
  
      message.colored = this.colored;
      tab_message.push(message);
      this.channelList[channel] = tab_message;
      this.messages = this.channelList[this.channelCurrent.realname];
    },
  
    joinPublic(name: string, mdp?: string): void {
      store.state.socket.emit('joinPublic', name, mdp);
    },
  
    joinPrivateMessage(target: string): void {
      // let newChannel: string;
      // if (store.state.username < target)
      //   newChannel = store.state.username.substring(0, 8) + " - " + target.substring(0, 8);
      // else
      //   newChannel = target.substring(0, 8) + " - " + store.state.username.substring(0, 8);
  
      // if (this.chanPrivate.find(e => e.name = newChannel)) {
      //   this.channelPrivate = newChannel;
      //   this.messages = this.channelList[this.channelPrivate];
      // }
      // else
      store.state.socket.emit('joinPrivateMessage', target);
      // store.state.socket.emit('joinPrivate', target);
    },
  
    joinPrivate(name: string): void {
      store.state.socket.emit('joinPrivate', name);
    },
  
    close_popup(): void {
      this.popup_alert = false;
      this.block_popup = false;
      this.block_popup_add = false;
      this.block_popup_inv = false;
      this.resp_inv = false;
      this.block_popup_profil = false;
    },
  
    set_block(): void {
      const index: number = this.blocked.indexOf(this.user_target);
      if (index != -1) {
        this.blocked.splice(index, 1);
        this.block = false;
      }
      else {
        this.blocked?.push(this.user_target);
        this.block = true;
      }
    }
   
  },
  updated(): void {
    const container = this.$el.querySelector(".chat");
    container.scrollTop = container.scrollHeight;
  },
  async mounted() {

    if (!(await this.isAccess("profil"))) return this.$router.push("login");
    if (!store.state.sock_init)
      store.commit("SET_SOCKET");
    else {
      this.initClient();
    }
    store.state.socket.off('connect').on("connect", () => {
      // store.state.username = store.state.socket.id;
    });

    store.state.socket.off('changeUsername').on("changeUsername", (payload: [any]) => {
    //  alert("je suis dans changeUsername");
     

      store.state.username = payload[0].newname;
      
      this.chanPrivate.forEach(e =>  {
        if (e.name == payload[0].oldname)
        {
          e.name = payload[0].newchan;
          // alert("new chanPrivate:\n" + this.chanPrivate);
        }
        payload.forEach(p => {
          if (e.name == p.oldchan)
          {
            e.name = p.newchan;
            e.key = p.newname;
          }
        });
      })
      this.initClient();
    });

    store.state.socket.off('setMod').on('setMod', (mod: string, value: boolean) => {
      if (mod == "ban")
        this.ban = value;
      else if (mod == "mute")
        this.mute = value;
      else if (mod == "block")
        this.block = value;
    });

    store.state.socket.off('msgToClient').on('msgToClient', (newMsg: Message, channel: { name: string, key: number }) => {
      if (typeof newMsg !== 'undefined' && typeof channel !== 'undefined') {
        if (this.blocked.indexOf(newMsg.username) === -1) {
          if (!this.chan.find(e => e.name == channel.name)) {
            this.chan.push(channel);
            this.channelList[channel.name] = [];
          }
          this.outputMessage(newMsg, channel.name);
        }
      }
    });

    store.state.socket.off('msgToClientPrivate').on('msgToClientPrivate', (newMsg: Message, channel: { name: string, key: number | string }) => {
      // alert("msgToClienPrivate");
      if (typeof newMsg !== 'undefined' && typeof channel !== 'undefined') {

        if (this.blocked.indexOf(newMsg.username) === -1) {
          if (!this.chanPrivate.find(e => e.name == channel.name)) {
            let chanName = '';
            if (channel.key == 8) {
              chanName = channel.name.substring(channel.name.indexOf('-') + 2);
              if (chanName == store.state.username)
                chanName = channel.name.substring(0, channel.name.indexOf('-') - 1);
              this.channelPrivate.name = chanName;
              this.channelCurrent.name = chanName;
            }
            channel.key = chanName;
            this.channelList[channel.name] = [];
            this.channelCurrent.realname = channel.name;
            this.channelPrivate.realname = channel.name;
            this.chanPrivate.push(channel);
            this.room = false;
            this.msg_alert = "New user send to you a message"
            this.popup_alert = true;
          }

          this.outputMessage(newMsg, channel.name);
        }
      }
    });

    store.state.socket.off('chanToClient').on('chanToClient', async (state: boolean, channel: { name: string, key: number }) => {
      if (typeof state !== 'undefined' && typeof channel !== 'undefined') {
        if (state === true) {
          if (!this.chan.find(e => e.name == channel.name)) {
            this.chan.push(channel);
            this.channelList[channel.name] = [];
          }
          this.channel = channel.name;
          this.channelCurrent.name = '';
          this.channelCurrent.realname = channel.name;
          await this.getMessagesInChannel(channel.name);
          this.listUsersCurrent = await this.getUserInChan(channel.name);
        }
      }
    });

    store.state.socket.off('alertMessage').on('alertMessage', async (msg: string) => {
      this.msg_alert = msg;
      this.popup_alert = true;
    });

    store.state.socket.off('chanToClientPrivate').on('chanToClientPrivate', async (state: boolean, channel: { name: string, key: number | string }) => {
      if (typeof state !== 'undefined' && typeof channel !== 'undefined') {
        if (state === true) {
          if (!this.chanPrivate.find(e => e.name == channel.name)) {
            this.channelList[channel.name] = [];
            let chanName = '';
            if (channel.key == 8) {
              chanName = channel.name.substring(channel.name.indexOf('-') + 2);
              if (chanName == store.state.username)
                chanName = channel.name.substring(0, channel.name.indexOf('-') - 1);
              this.channelPrivate.name = chanName;
              this.channelCurrent.name = chanName;
            }
            channel.key = chanName;
            this.channelPrivate.realname = channel.name;
            this.channelCurrent.realname = channel.name;
            this.chanPrivate.push(channel);
            
          }
          this.room = false;
          await this.getMessagesInChannel(channel.name);


          this.listUsersCurrent = await this.getUserInChan(channel.name);
        }
      }
    });

    store.state.socket.off('new_user').on('new_user', (username: string) => {
      if (!this.listUsersCurrent.find(e => e == username))
        this.listUsersCurrent.push(username);
    });

    store.state.socket.off('del_user').on('del_user', (username: string) => {
      const index = this.listUsersCurrent.findIndex(e => e == username);
      if (index)
        this.listUsersCurrent.splice(index, 1);
    });

    store.state.socket.off('rcvInvite').on('rcvInvite', (channel: string) => {
      this.conf(channel);
    });

    store.state.socket.off('initClient').on('initClient', (username: string) => {
      store.state.username = username;
      this.initClient();
    });
  }

})
// export default class Chat extends Vue {}


// export default class Chat extends Vue {

//   chan: string[] = [];
//   chanPrivate: string[] = [];
//   muted: string[] = [];
//   username = "";
//   inputMsg: string = '';
//   messages: Message[] = [];
//   channel: string = "General";
//   channelPrivate: string = "";
//   channelCurrent: string = "General";
//   channelList: {[key:string]: Message[]} = { "General": this.messages};
//   socket: any;
//   colored = false;
//   room = true;
//   listUsersCurrent: string[] = [];
//   listUsers: string[] = [];
//   listChannelPublic: string[] = [];

//   public block_popup = false;
//   block_popup_add = false;
//   block_popup_inv = false;
//   resp_inv = false;
//   name = "";
//   // type = "public";
//   mdp = "";
//   mdp2 = "";

//   public postMSG(e : any) {
//       e.preventDefault();

//       const msg = this.inputMsg;

//       msg.trim();
    
//       if (!msg) {
//         return false;
//       }

//       //upgrade parser
//       if (msg.substring(0, 7) === "/block ") {
//         if (this.muted.indexOf(msg.substring(6)) === -1)
//           this.muted.push(msg.substring(6));
//       }
//       else if (msg.substring(0, 9) === "/unblock ") {
//         const index: number = this.muted.indexOf(msg.substring(8));
//         if (index != -1)
//           this.muted.splice(index, 1);
//       }
//       else if (msg.substring(0, 6) === "/mute ") {
//         const name: string = msg.substring(6);
//         store.state.socket.emit('muteUserServer', name, this.channel);
//       }
//       else if (msg.substring(0, 8) === "/unmute ") {
//         const name: string = msg.substring(8);
//         store.state.socket.emit('unmuteUserServer', name, this.channel);
//       }
//       else if (msg.substring(0, 5) === "/ban ") {
//         const name: string = msg.substring(5);
//         store.state.socket.emit('banUserServer', name, this.channel);
//       }
//       else if (msg.substring(0, 7) === "/unban ") {
//         const name: string = msg.substring(7);
//         store.state.socket.emit('unbanUserServer', name, this.channel);
//       }
//       else if (msg.substring(0, 6) === "/join ") {
//         const data = msg.split(" ", 3);
//         let pass = data[2];

//         // let hash = CryptoJS.SHA256(data[2]).toString(CryptoJS.enc.Hex);
//         this.joinPublic(data[1], pass);
//       }
//       else if (msg.substring(0, 4) === "/pm ") {
//         this.joinPrivateMessage(msg.substring(4));
//       }
//       else if (msg.substring(0, 4) === "/cp ") {
//         this.joinPrivate(msg.substring(4));
//       }
//       else if (msg.substring(0, 5) === "/inv ") {
//         store.state.socket.emit('invite', msg.substring(5), this.channelPrivate);
//       }
//       else if (msg.substring(0, 7) === "/admin ") {
//         store.state.socket.emit('setAdmin', msg.substring(7), this.channel);
//       }
//       else if (msg.substring(0, 8) === "/uadmin ") {
//         store.state.socket.emit('unSetAdmin', msg.substring(8), this.channel);
//       }
//       else if (msg.substring(0, 5) === "/mod ") {
//         store.state.socket.emit('displayMods', msg.substring(5), this.channel);
//       }
//       else if (msg.substring(0, 6) === "/pass ") {
//         // let hash = CryptoJS.SHA256(msg.substring(6).replace(/\s/g, "")).toString(CryptoJS.enc.Hex);
//         let pass = msg.substring(6).replace(/\s/g, "");
//         store.state.socket.emit('passChan', pass, this.channel);
//       }
//       else {
//         let newMsg = new Message(this.username, msg);
//         if (this.room)
//         {
//           store.state.socket.emit('msgToServer', newMsg, this.channel);
//         }
//         else
//           store.state.socket.emit('msgToServerPrivate', newMsg, this.channelPrivate);
//       }

//       this.inputMsg = '';
//   }

//   public active_pop_add () {
//     this.block_popup_add = true;
//     this.getListUser('General');
//     this.getListChannel();
//   }

//   public async changeChannel ( e : any) {
//     e.preventDefault();
//     this.channelCurrent = e.target.value;
//     if (this.room)
//     {
//       this.channel = this.channelCurrent;
      
//       // await store.state.socket.emit('getChanListByMode', 'public');
//     }
//     else
//     {
//       this.channelPrivate = this.channelCurrent;
//       // await store.state.socket.emit('getChanListByMode', 'private');
//     }
//     this.messages = this.channelList[this.channelCurrent];
//     await store.state.socket.emit('getMessagesInChannel', this.channelCurrent);
//     this.getListUser(this.channelCurrent);
//     this.getListChannel();
//   }

//   public async changeRoom (room: boolean) {
//     this.room = room;
//     if (this.room)
//     {
//       this.channelCurrent = this.channel;
//       // await this.getListUser(this.channelCurrent);
//       // await store.state.socket.emit('getChanListByMode', 'public');
//     }
//     else
//     {
//       this.channelCurrent = this.channelPrivate;
//       // if (this.channelPrivate)
//       // await store.state.socket.emit('getChanListByMode', 'private');
//     }
//     await this.getListUser(this.channelCurrent);
//     await store.state.socket.emit('getMessagesInChannel', this.channelCurrent);
//     // await this.getListUser(this.channelCurrent);
//     // this.getListChannel();
//     // this.messages = this.channelList[this.channelCurrent];
//       // this.getListChannel();

//   }

//   public async getListUser(channel: string){
//     await store.state.socket.emit('getUsersInChan', channel);
//   }

//   public async getListChannel(){
//     await store.state.socket.emit('getChanList', this.channelCurrent);
//   }

//   created () {
//     alert('je suis dans created');
//     if (!store.state.sock_init)
//       store.commit("SET_SOCKET");
//     // this.username = store.state.socket.id;
//     // this.chan.push("General");

//     store.state.socket.on("connect", () => {
//       alert("je suis dans connect");
//       this.username = store.state.socket.id;
//     });

//     // await store.state.socket.on('UserInChan', (listUsers: string[]) => {
//     //   this.listUsersCurrent = listUsers;
//     // });

//     // await store.state.socket.on('ChanInList', (listChannel: string[]) => {
//     //   this.listChannelPublic = listChannel;
//     // });

//     // await store.state.socket.on('msgToClientPrivate', (newMsg: Message, channel: string) => {
//     //    if (typeof newMsg !== 'undefined' && typeof channel !== 'undefined') {
//     //      if (this.muted.indexOf(newMsg.username) === -1) {
//     //        if (this.chanPrivate.indexOf(channel) === -1) {
//     //          this.channelPrivate = channel;
//     //          this.chanPrivate.push(channel);
//     //          this.channelList[channel] = [];
//     //        }
//     //        this.outputMessage(newMsg, channel);
//     //      }
//     //    }
//     //  });

//     //  await store.state.socket.on('chanToClient', (state: boolean, msg:string) => {
//     //   alert("je suis dans chanToClient");
//     //   if (typeof state !== 'undefined' && typeof msg !== 'undefined') {
//     //     if (state === true) {
//     //       if (this.chan.indexOf(msg) === -1) {
//     //         this.chan.push(msg);
//     //         this.channelList[msg] = [];
//     //       }
//     //       this.channel =  msg;
//     //       this.channelCurrent = msg;
//     //       store.state.socket.emit('getMessagesInChannel', msg);
          
//     //     //  this.messages = this.channelList[this.channel];
//     //      this.getListUser(this.channelCurrent);
//     //     }
//     //     else {
//     //       alert("message non definie " + msg);
//     //     }
//     //   }
//     // });

//     // await store.state.socket.on('chanToClientPrivate', (state: boolean, msg:string) => {
//     //    if (typeof state !== 'undefined' && typeof msg !== 'undefined') {
//     //      if (state === true) {
//     //        if (this.chanPrivate.indexOf(msg) === -1) {
//     //         this.chanPrivate.push(msg);
//     //          this.channelList[msg] = [];
//     //        }
           
//     //        this.channelPrivate =  msg;
//     //        this.messages = this.channelList[this.channelPrivate];
//     //      }
//     //      else {
//     //        alert(msg);
//     //      }
//     //    }
//     //  });

//     //  await store.state.socket.on('getMessagesInChannel', (msg : Message[]) => {
       
//     //   //  let tab: Message[] = [];
//     //   //  tab[0] = msg;
//     //    this.channelList[this.channelCurrent] = msg;
//     //    this.messages = msg;
//     //   //  alert(this.messages[0]);
//     //   // alert(this.messages[0]["time"]);
//     // });

//     // await store.state.socket.on('ChanListByMode', (list : string[], mod: string) => {
//     //   if (mod == 'public')
//     //   this.chan = list;
//     //   else if (mod == 'private')
//     //   this.chanPrivate = list;
//     //   if (!this.channelPrivate && this.chanPrivate.length)
//     //   {
//     //     this.channelPrivate = this.chanPrivate[0];
//     //   }
//     //   alert("chan = " + list.length);
//     // });

//     //  await store.state.socket.on('rcvInvite', (channel:string) => {
//     //   this.conf(channel);
//     // });

//     // await store.state.socket.emit('getMessagesInChannel', this.channelCurrent);
//     // await store.state.socket.emit('getChanListByMode', 'public');
//     // await store.state.socket.emit('getChanListByMode', 'private');
//     // await this.getListUser(this.channelCurrent);
//     // await this.getListChannel();
//   }

//   // updated() {
//   //   var container = this.$el.querySelector(".chat");
//   //   container.scrollTop = container.scrollHeight;
//   // }

//   async conf(channel: string)
//   {
//     if (typeof channel !== 'undefined') {
//       this.channelCurrent = channel;
//       this.block_popup_inv = true;
//       // const msg = "You are invited on " + channel;
//     }
//   }

//   async response_inv(ret: boolean) {
//     await store.state.socket.emit('valInvite', ret, this.channelCurrent);
//     this.block_popup_inv = false;
//   }

//   // create_room() {
//   //   alert("createRoom");
//   //   if (this.mdp != this.mdp2)
//   //     return;
//   //   let msg = "";
//   //   alert("createRoom mdp passed");
//   //   if (this.room)
//   //   {
//   //     msg = "/join " + this.name + " " + this.mdp;
//   //     const data = msg.split(" ", 3);
//   //     // let pass = data[2];
//   //     // let hash = CryptoJS.SHA256(data[2]).toString(CryptoJS.enc.Hex);
//   //     this.joinPublic(data[1], this.mdp);
//   //   }
//   //   else
//   //   {
//   //     msg = "/cp " + this.name;
//   //     this.joinPrivate(msg.substring(4));
//   //   }
//   //   this.block_popup = false;
//   // }

//   async addUser() {
//     let msg = "";
//     msg = "/inv " + this.name;

//     await store.state.socket.emit('invite', msg.substring(5), this.channelPrivate);
//     this.block_popup_add = false;
//   }


//   outputMessage(message : Message, channel: string) {
//     let tab_message = this.channelList[channel];
//     if (tab_message && tab_message.length)
//       this.colored = tab_message[tab_message.length -1].colored;
//     if (tab_message.length && tab_message[tab_message.length -1].username != message.username)
//     {
//       if (this.colored)
//         this.colored = false;
//       else
//         this.colored = true;
//     }
//     message.colored = this.colored;
//     alert("je suis dans outputMessage");
//     tab_message.push(message);
//     this.channelList[channel] = tab_message;
//     this.messages = this.channelList[this.channelCurrent];
//   }

//   joinPublic(name : string, mdp?: string) {
//     // alert("join Public");
//     // if (this.chan.indexOf(name) !== -1) {
//     //   this.channel =  name;
//     //   this.messages = this.channelList[this.channel];
//     // }
//     // else
//     // {
//       store.state.socket.emit('joinPublic', name, mdp);
//     // }
//   }

//   joinPrivateMessage(target : string) {
//     let newChannel:string;
//     if (this.username < target)
//       newChannel = this.username.substring(0, 8) + " - " + target.substring(0, 8);
//     else
//       newChannel = target.substring(0, 8) + " - " + this.username.substring(0, 8);
//     if (this.chanPrivate.indexOf(newChannel) !== -1) {
//       this.channelPrivate =  newChannel;
//       this.messages = this.channelList[this.channelPrivate];
//     }
//     else
//       store.state.socket.emit('joinPrivateMessage', target);
//   }

//   joinPrivate(name : string) {
//     if (this.chan.indexOf(name) !== -1) {
//       this.channel =  name;
//       this.messages = this.channelList[this.channel];
//     }
//     else
//       store.state.socket.emit('joinPrivate', name);
//   }

//   public close_popup() {
//     this.block_popup = false;
//     this.block_popup_add = false;
//     this.block_popup_inv = false;
//     this.resp_inv = false;
//   }

// }