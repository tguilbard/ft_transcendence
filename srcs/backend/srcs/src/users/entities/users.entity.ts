import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne } from 'typeorm'
import { TimeStampEntities } from './generics/timestamp.entity';
import DatabaseFile from "../../Photo/databaseFile.entity"

@Entity('Users')
export class UserEntity extends TimeStampEntities {

	@PrimaryGeneratedColumn() //i dont know why it is mandatory
	id: number

	@Column(
		{
			update: true,
			nullable: false,
			//unique: true
		})
	login: string;

	@Column(
		{
			update: true,
			nullable: false,
			//unique: true
		})
	pseudo: string;

	@Column(
		{
			enum: ["in match", "log in", "log out"],
			default: "log out",
			nullable: false,
		})
	state: string

	@Column(
		{
			nullable: true
		})
	tfaSecret: string

	@Column(
		{
			nullable: false,
			default: false
		})
	tfaActivated: boolean

	friends: UserEntity[]

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


}
