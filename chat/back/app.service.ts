import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserObject } from './app.entities';

export enum Chantype {
  public = 1,
  private = 1 << 1,
  protected = 1 << 2
}

export enum Usertype {
  owner = 1,
  admin = 1 << 1,
  mute = 1 << 2,
  // On peut garder les users ban dans la listes des users.
  // Il suffira à chaque fois de ne pas afficher l'user si il a le flag ban
  // Réfléchir à un potentiel fichier avec le temps de ban
  ban = 1 << 3
}

export class UserMode {
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

  displayFlag(): void {
    // Pour debug
    if (this.flagIsSet(Usertype.owner)) console.log('OWNER');
    if (this.flagIsSet(Usertype.admin)) console.log('ADMIN');
    if (this.flagIsSet(Usertype.mute)) console.log('MUTE');
    if (this.flagIsSet(Usertype.ban)) console.log('BAN');
  }
}

export class Chan {

  /* Userobject
  * User
  * UserMode
  */
  userList: UserObject[] = [];


  type: Chantype;
  
  pass: string;
  name: string; // réfléchir à la gestion des private messages (nom des deux personnes)

  constructor(u: User, name: string, type?: Chantype, pass?: string) {
    let userMode = new UserMode(Usertype.owner | Usertype.admin);
    let user = new UserObject(u, userMode);
    this.userList.push(user);
    if (type) this.type = type;
    else if (type === Chantype.protected) this.pass = pass ? pass : "";
    this.name = name;
  }

  // @SubscribeMessage('addUserServer')
  addUser(u: User): boolean {
    // le problème vient du fait qu'on ne sait pas si il n'y a personne qui porte
    // le même nom ou qu'il y a déjà le nom dedans
    let user = this.findUser(u);
    if (user) {
      if (user.userMode.flagIsSet(Usertype.ban)) return false;
    }
    else this.userList.push(new UserObject(u, new UserMode(0)));
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

  // en lien avec @SubscribeMessage('banUserServer')
  banUser(sender: User, u: User): boolean {
    let user = this.findUser(u);
    if (user) {
      if (this.kickUser(sender, u)) {
        user.userMode.setFlag(Usertype.ban);
        // this.emit('banUserClient', u), récupérer l'info pour ne plus
        // afficher sur le front le chan
        return true;
      }
    }
    return false;
    // Renvoyer un message sinon
    // e.g. "User ${u.nick} is not on the channel"
  }

  // en lien avec @SubscribeMessage('kickUserServer')
  kickUser(sender: User, u: User): boolean {
    if (
      ((this.findAdmin(sender) && !this.findAdmin(u)) ||
        this.findOwner(sender)) &&
      this.removeUser(u)
    )
      return true;
    // this.emit('kickUserClient', u) récupérer l'info pour ne plus
    // afficher sur le front le chan
    // Renvoyer un message sinon : e.g. ban user
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

  // en lien avec @SubcribeMessage('passServer')
  updatePass(sender: User, pass: string) {
    // Temporaire
    // Crypter le pass et l'ajouter dans la db
    if (this.findOwner(sender)) {
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
  // Voir si on les met en private avec des getters
  id: string;
  nick: string;
  socket: Socket;
  // Ajouter un socket qui lui est associé en front

  constructor(id: string, nick: string, socket: Socket) {
    this.id = id;
    this.nick = nick;
    this.socket = socket;
  }
}