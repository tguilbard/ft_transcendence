import { ChannelEntity } from "src/chat/entities/channel.entity";
import { MemberEntity } from "src/chat/entities/member.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('Messages')
export class MessageEntity {

	@PrimaryGeneratedColumn()
	id : number;
	
	@Column({
		nullable: false
	})
	text: string;

	@CreateDateColumn()
	createdAt: Date;

	@ManyToOne(Type => MemberEntity, (member) => member.id, {
		cascade: false,
		nullable: false,
		onDelete: "CASCADE"
	})
	member: MemberEntity;

	@ManyToOne(Type => ChannelEntity, (channel) => channel, {
		cascade: false,
		nullable: false,
		onDelete: "CASCADE"
	})
	channel: ChannelEntity;
}