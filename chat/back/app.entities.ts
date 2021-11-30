import { User, Mode } from "./app.service";

export class UserObject {
    user: User;
    userMode: Mode

    constructor(user: User, userMode: Mode) {
        this.user = user;
        this.userMode = userMode;
    }
}