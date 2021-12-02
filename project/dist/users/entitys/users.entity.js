"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersEntity = void 0;
const typeorm_1 = require("typeorm");
const databaseFile_entity_1 = require("../../Photo/databaseFile.entity");
let UsersEntity = class UsersEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UsersEntity.prototype, "index", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], UsersEntity.prototype, "enableTwoFactorAuth", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UsersEntity.prototype, "twoFactorAuthSecret", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 15, unique: true }),
    __metadata("design:type", String)
], UsersEntity.prototype, "userID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", String)
], UsersEntity.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 3000 }),
    __metadata("design:type", Number)
], UsersEntity.prototype, "ladderRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], UsersEntity.prototype, "totalWin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], UsersEntity.prototype, "totalLose", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'login' }),
    __metadata("design:type", String)
], UsersEntity.prototype, "userState", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: 'notMatched' }),
    __metadata("design:type", String)
], UsersEntity.prototype, "isMatched", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UsersEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UsersEntity.prototype, "modifiedAt", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: 'avatarId' }),
    (0, typeorm_1.OneToOne)(() => databaseFile_entity_1.default, {
        nullable: true
    }),
    __metadata("design:type", databaseFile_entity_1.default)
], UsersEntity.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], UsersEntity.prototype, "avatarId", void 0);
UsersEntity = __decorate([
    (0, typeorm_1.Entity)('users')
], UsersEntity);
exports.UsersEntity = UsersEntity;
//# sourceMappingURL=users.entity.js.map