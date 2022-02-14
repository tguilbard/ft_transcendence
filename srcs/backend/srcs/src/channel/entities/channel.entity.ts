import { TimeStampEntity } from "src/generics/entities/timestamp.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MemberEntity } from "../member/entities/member.entity";
import { MessageEntity } from "../message/entitites/message.entity";


@Entity('Channels')
export class ChannelEntity extends TimeStampEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		nullable: false,
		unique: true
	})
	name: string;

	@Column({
		nullable: false,
	})
	mode: number

	@Column({
		nullable: true,
		select: false //don't see automaticaly this column
	})
	password: string;

	@Column({
		nullable: true
	})
	createdAt: Date;

	@OneToMany(type => MessageEntity, (message) => message.channel, {
		cascade: false,
		nullable: true
	})
	messages: MessageEntity[];

	@OneToMany(type => MemberEntity, (member) => member.channel, {
		cascade: false,
		nullable: true
	})
	members: MemberEntity[];
}