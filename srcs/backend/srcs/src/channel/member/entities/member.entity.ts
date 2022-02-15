import { ChannelEntity } from "src/channel/entities/channel.entity";
import { ModeService } from "src/channel/generics/mode.class";
import { TimeStampEntity } from "src/generics/entities/timestamp.entity";
import { UserEntity } from "src/users/entities/users.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { MemberType } from "../enum/member-type.enum";

@Entity("Members")
@Unique(['user', 'channel'])
export class MemberEntity extends TimeStampEntity {

	@PrimaryGeneratedColumn()
	id : number;

	@Column({
		nullable: true,
		default: null
	})
	BanUntil: Date

	@Column({
		nullable: true,
		default: null
	})
	MuteUntil: Date

	@Column({
		nullable: false,
		default: 0
	})
	mode: number

	@Column({
		nullable: false,
		default: 0
	})
	unreadMessage: number

	@ManyToOne(type => UserEntity, {
		cascade: false, 
		nullable: false
	})
	user: UserEntity
	// @JoinColumn()

	@ManyToOne(type => ChannelEntity, (channel) => channel.members, {
		nullable: false,
		onDelete: "CASCADE"
	})
	channel: ChannelEntity
}