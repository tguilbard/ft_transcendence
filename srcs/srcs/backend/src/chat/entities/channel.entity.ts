import { TimeStampEntity } from "src/generics/entities/timestamp.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChannelType } from "../enum/channel-type.enum";
import { MemberEntity } from "./member.entity";
import { MessageEntity } from "./message.entity";


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
		default: ChannelType.public
	})
	mode: number

	@Column({
		nullable: true,
		select: false //don't see automaticaly this column
	})
	password: string;

	@OneToMany(type => MessageEntity, (message) => message.member.channel, {
		nullable: true,
	})
	messages: MessageEntity[];

	@OneToMany(type => MemberEntity, (member) => member.channel, {
		nullable: true,
	})
	members: MemberEntity[];
}