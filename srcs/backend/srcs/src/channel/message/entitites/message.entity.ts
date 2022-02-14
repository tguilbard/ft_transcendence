
import { ChannelEntity } from "src/channel/entities/channel.entity";
import { MemberEntity } from "src/channel/member/entities/member.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('Messages')
export class MessageEntity {

	@PrimaryGeneratedColumn()
	id : number;
	
	@Column({
		nullable: false
	})
	text: string;

	@Column({
		nullable: true
	})
	createdAt: Date;

	@ManyToOne(Type => MemberEntity, (member) => member.id, {
		cascade: false,
		nullable: false
	})
	member : MemberEntity;

	@ManyToOne(Type => ChannelEntity, (channel) => channel, {
		cascade: false,
		nullable: false //must be false
	})
	channel : ChannelEntity;
}