import { User, UserMode } from "./app.service";

export class UserObject {
    user: User;
    userMode: UserMode

    constructor(user: User, userMode: UserMode) {
        this.user = user;
        this.userMode = userMode;
    }
}