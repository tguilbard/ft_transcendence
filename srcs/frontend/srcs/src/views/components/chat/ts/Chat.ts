import { Options, Vue } from 'vue-class-component';
import ChanBut from '../ChanBut.vue';
import Menu from "../../Menu.vue"; // @ is an alias to /src
import PopUp from '../../PopUp.vue'
import store from '../../../store';
import { NavigationFailure } from 'vue-router';

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

// props: {
//   testProp: Object as () => { test: boolean }
// } 

@Options({
  components: {
    ChanBut,
    Menu,
    PopUp
  },
})
export default class Chat extends Vue {

  private chan: [{ name: string, key: number | string, }] = [{ name: '', key: 0 }];
  private chanPrivate: [{ name: string, key: number | string, }] = [{ name: '', key: '' }];
  
  private blocked: string[] = [];
  private username = "";
  private inputMsg = '';
  private messages: Message[] = [];
  private channel = "General";
  private channelPrivate: { name: string, realname: string } = { name: '', realname: '' };
  private channelCurrent: { name: string, realname: string } = { name: '', realname: 'General' };
  private channelList: { [key: string]: Message[] } = { "General": this.messages };
  private colored = false;
  private room = true;
  private listUsersCurrent: string[] = [];
  private listUsersGeneral: string[] = [];
  private listChannelPublic: string[] = [];

  public block_popup = false;
  private block_popup_add = false;
  private block_popup_inv = false;
  private popup_alert = false;
  private resp_inv = false;
  private name = "";
  private user_target = "";
  private block_popup_profil = false;
  private ban = false;
  private mute = false;
  private block = false;
  private mod = "";
  private msg_alert = "";

  get getChan (): [{ name: string, key: number | string }] {
    return this.chan;
  }

  get getChanPrivate (): [{ name: string, key: number | string, }] {
    return this.chanPrivate;
  }

  get getListUsersCurrent (): string[] {
    return this.listUsersCurrent;
  }

  get getChannelCurrent (): { name: string, realname: string } {
    return this.channelCurrent;
  }

  get getMessages (): Message[] {
    return this.messages;
  }

  async created(): Promise<void | NavigationFailure> {

    if (!(await this.isAccess("profil"))) return this.$router.push("login");
    if (!store.state.sock_init)
      store.commit("SET_SOCKET");
    else {
      this.initClient();
    }
    store.state.socket.off('connect').on("connect", () => {
      // store.state.username = store.state.socket.id;
    });

    store.state.socket.off('changeUsername').on("changeUsername",
    (payload: [{oldname: string, newname: string, oldchan: string, newchan: string}]) => {
    //  alert("je suis dans changeUsername");
    //  alert("username = " + store.state.username);
    //  alert("this.channelcurent.name = " + this.channelCurrent.name);
    //  alert("this.channelcurent.realname = " + this.channelCurrent.realname);
    //  alert("this.channelprivate.name = " + this.channelPrivate.name);
    //  alert("this.channelprivate.realname = " + this.channelPrivate.realname);
     

      // store.state.username = payload[0].newname;
      
      // this.chanPrivate.forEach(e =>  {
      //   if (e.name == payload[0].oldname)
      //   {
      //     e.name = payload[0].newchan;
      //     // alert("new chanPrivate:\n" + this.chanPrivate);
      //   }
      //   payload.forEach(p => {
      //     if (e.name == p.oldchan)
      //     {
      //       e.name = p.newchan;
      //       if (store.state.username != p.newname)
      //         e.key = p.newname;
      //     }
      //   });
      // })
    
      payload.forEach(e => {
        if (this.channelCurrent.realname == e.oldchan)
        {
          this.channelCurrent.realname = e.newchan;
          // if (store.state.username != e.newname)
            this.channelCurrent.name = e.newname;
            if (this.channelPrivate.realname == e.oldchan)
              this.channelPrivate.realname = e.newchan;
            // if (store.state.username != e.newname)
              this.channelPrivate.name = e.newname;
        }
      })
        
      // if (this.channelPrivate.realname == payload[0].oldchan)
      // {
      //   this.channelPrivate.realname = payload[0].newchan;
      //   this.channelPrivate.name = payload[0].newname;
      // }
      alert("this.channelcurent.name = " + this.channelCurrent.name);
     alert("this.channelcurent.realname = " + this.channelCurrent.realname);
     alert("this.channelprivate.name = " + this.channelPrivate.name);
     alert("this.channelprivate.realname = " + this.channelPrivate.realname);
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
      store.commit("SET_USERNAME", username);
      this.initClient();
    });
  }
  
		
  private async initClient() {
    // alert("username = " + store.state.username);
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
    // alert("channel private = " + this.channelPrivate.realname);

    this.listUsersCurrent = await this.getUserInChan(this.channelCurrent.realname);
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
      return await response.json();
    return false;
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
      this.channelList[this.channelCurrent.realname] = resp;
      this.messages = resp;
    }
  }

  private async getChanListByMode(chanMode: string) {
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
  }

  private async isAccess(p_path: string): Promise<boolean> {
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
  }

  private async getUserInChan(chanName: string) {
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
  }

  public postMSG(e: { preventDefault: () => void; target: { value: string; }; }): false | undefined {
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
  }

  private async active_pop_add(): Promise<void> {
    this.block_popup_add = true;
    this.listUsersGeneral = await this.getUserInChan("General");
    this.listChannelPublic = await this.getListChannelPublic();
  }

  private async active_pop_profil(user: string): Promise<void> {
    this.user_target = user;
    const index: number = this.blocked.indexOf(user);
    if (index != -1)
      this.block = true;
    else
      this.block = false;
    this.block_popup_profil = true;
  }

  private async changeChannel(chan: { name: string, key: number | string }): Promise<void> {
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
  }

  private async changeRoom(room: boolean): Promise<void> {
    this.room = room;
    // alert("realname = " + this.channelPrivate.realname + " et name = " + this.channelPrivate.name);
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
    // alert("realname = " + this.channelPrivate.realname + " et name = " + this.channelPrivate.name);

  }

  updated(): void {
    const container = this.$el.querySelector(".chat");
    container.scrollTop = container.scrollHeight;
  }

  private async conf(channel: string): Promise<void> {
    if (typeof channel !== 'undefined') {
      this.channelCurrent.realname = channel;
      this.channelCurrent.name = '';
      this.block_popup_inv = true;
      // const msg = "You are invited on " + channel;
    }
  }

  private async response_inv(ret: boolean): Promise<void> {
    store.state.socket.emit('valInvite', ret, this.channelPrivate.realname);
    this.block_popup_inv = false;
  }

  private async addUser(): Promise<void> {
    await store.state.socket.emit('invite', this.name, this.channelPrivate.realname);
    this.block_popup_add = false;
  }

  private outputMessage(message: Message, channel: string): void {
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
  }

  private joinPublic(name: string, mdp?: string): void {
    store.state.socket.emit('joinPublic', name, mdp);
  }

  private joinPrivateMessage(target: string): void {
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
  }

  private joinPrivate(name: string): void {
    store.state.socket.emit('joinPrivate', name);
  }

  private close_popup(): void {
    this.popup_alert = false;
    this.block_popup = false;
    this.block_popup_add = false;
    this.block_popup_inv = false;
    this.resp_inv = false;
    this.block_popup_profil = false;
  }

  private set_block(): void {
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
}