import { TimeStampEntity } from '../../generics/entities/timestamp.entity';
import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne, ManyToMany, OneToMany, JoinTable } from 'typeorm'
import DatabaseFile from "../avatar/entities/avatar.entity"
import { MatchEntity } from 'src/game-history/entities/game-history.entity';

@Entity('Users')
export class UserEntity extends TimeStampEntity {

	@PrimaryGeneratedColumn()
	id: number

	@Column({
		update: true,
		nullable: true,
		unique: true
	})
	login: string;

	@Column({
		update: true,
		nullable: false,
		unique: true
	})
	username: string;

	@Column(
		{
			enum: ["in match", "login", "logout"],
			default: "logout",
			nullable: false,
		})
	state: string

	@Column({
		nullable: false,
		default: 0
	})
	elo: number

	@Column({
		nullable: false,
		default: 0
	})
	numberOfGame: number

	@Column({
		nullable: false,
		default: 0
	})
	achievementUnlock: number

	@Column({
		nullable: false,
		default: false
	})
	guest: boolean

	@Column({
		nullable: true,
		default: null
	})
	tfaSecret: string

	@Column({
		nullable: false,
		default: false
	})
	tfaActivated: boolean

	@Column({
		nullable: false,
		default: 0
	})
	numberOfFriend: number

	@ManyToMany(() => UserEntity, (user) => user.friends,
	{
		onDelete: "CASCADE"
	})
	@JoinTable({name: "Friends"})
	friends: UserEntity[]

	@ManyToMany(() => UserEntity, (user) => user.blockedUsers,
	{
		onDelete: "CASCADE"
	})
	@JoinTable({name: "blockedUsers"})
	blockedUsers: UserEntity[]

	@JoinColumn({ name: 'avatarId' })
	@OneToOne(
		() => DatabaseFile,
		{
			nullable: true
		}
	)
	public avatar?: DatabaseFile;

	@Column({ nullable: true })
	public avatarId?: number;

	@OneToMany(type => MatchEntity, (match) => match.id, {
		nullable: true
	})
	history: MatchEntity[]

	@Column({
		nullable: false,
		default: 0
	})
	mode: number
}