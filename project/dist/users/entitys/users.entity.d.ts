import DatabaseFile from "../../Photo/databaseFile.entity";
export declare class UsersEntity {
    index: number;
    enableTwoFactorAuth: boolean;
    twoFactorAuthSecret: string;
    userID: string;
    nickname: string;
    ladderRating: number;
    totalWin: number;
    totalLose: number;
    userState: string;
    isMatched: string;
    createdAt: Date;
    modifiedAt: Date;
    avatar?: DatabaseFile;
    avatarId?: number;
}
