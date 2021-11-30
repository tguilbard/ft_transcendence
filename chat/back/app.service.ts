import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserObject } from './app.entities';

export enum ChanType {
  public = 1,
  private = 1 << 1,
  protected = 1 << 2
}

export enum Usertype {
  owner = 1,
  admin = 1 << 1,
  mute = 1 << 2,
  ban = 1 << 3
}

export class Mode {
  flag: number;

  constructor(flag?: number) {
    this.flag = flag;
  }

  flagIsSet(flag: number): boolean {
    if (flag & this.flag)
        return true;
    return false;
  }

  setFlag(flag: number): void {
      this.flag |= flag;
  }

  unsetFlag(flag: number): void {
      this.flag &= ~flag;
  }
}

export class Chan {

  userList: UserObject[] = [];
  mode: Mode;
  pass: string;
  name: string;

  constructor(u: User, name: string, type: ChanType, pass?: string) {
    let userMode = new Mode(Usertype.owner | Usertype.admin);
    let user = new UserObject(u, userMode);
    this.userList.push(user);
    this.mode = new Mode(type);
    if (this.mode.flagIsSet(ChanType.protected)) this.pass = pass ? pass : "";
    this.name = name;
  }

  addUser(u: User): boolean {
    let user = this.findUser(u);
    if (user) {
      if (user.userMode.flagIsSet(Usertype.ban)) return false;
    }
    else this.userList.push(new UserObject(u, new Mode(0)));
    return true;
  }

  removeUser(u: User): boolean {
    let i = 0;
    for (let user of this.userList) {
      if (u.nick === user.user.nick) {
        this.userList.splice(i, 1);
        return true;
      }
      i += 1;
    }
    return false;
  }

  leaveChan(u: User): void {
    this.removeUser(u);
  }

  banUser(sender: User, u: User): boolean {
    let user = this.findUser(u);
    if (user) {
      if (this.kickUser(sender, u)) {
        user.userMode.setFlag(Usertype.ban);
        return true;
      }
    }
    return false;
  }

  kickUser(sender: User, u: User): boolean {
    if (
      ((this.findAdmin(sender) && !this.findAdmin(u)) ||
        this.findOwner(sender)) &&
      this.removeUser(u)
    )
      return true;
    return false;
  }

  upToAdmin(sender: User, u: User): boolean {
    let user = this.findUser(u);
    if (this.findOwner(sender) && user && !this.findAdmin(u)) {
      user.userMode.setFlag(Usertype.admin);
      return true;
    }
    return false;
  }

  muteUser(sender: User, u: User): boolean {
    let Usender = this.findUser(sender);
    let user = this.findUser(u);
    if (Usender && user && (Usender.userMode.flagIsSet(Usertype.owner)
    || (Usender.userMode.flagIsSet(Usertype.admin)
    && !user.userMode.flagIsSet(Usertype.admin)))) {
      user.userMode.setFlag(Usertype.mute);
      return true;
    }
    return false;
  }

  updatePass(sender: User, pass: string): void {
    if (this.findOwner(sender)) {
      if (!this.mode.flagIsSet(ChanType.protected)) {
        this.mode.setFlag(ChanType.protected);
      }
      this.pass = pass;
    }
  }

  findUser(u: User): UserObject | null {
    console.log(this.userList);
    for (let user of this.userList) {
      if (user && u.nick === user.user.nick) return user;
    }
    return null;
  }

  findUserBan(u: User): UserObject | null {
    let user = this.findUser(u);
    if (user && user.userMode.flagIsSet(Usertype.ban)) return user;
    return null;
  }

  findAdmin(u: User): UserObject | null {
    let user = this.findUser(u);
    if (user && user.userMode.flagIsSet(Usertype.admin)) return user;
    return null;
  }

  findOwner(u: User): UserObject | null {
    let user = this.findUser(u);
    if (user && user.userMode.flagIsSet(Usertype.owner)) return user;
    return null;
  }
}

export class User {

  id: string;
  nick: string;
  socket: Socket;

  constructor(id: string, nick: string, socket: Socket) {
    this.id = id;
    this.nick = nick;
    this.socket = socket;
  }
}

export class Message {
  msg: string;
  constructor(user?: string, content?: string) {
    this.msg = "";
    let dateTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    if (content && user)
      this.msg += "[" + dateTime + "]\n" + user + ": " + content;
  }
}