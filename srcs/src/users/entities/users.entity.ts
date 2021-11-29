import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { TimeStampEntities } from './generics/timestamp.entity';

@Entity('Users')
export class UserEntity extends TimeStampEntities {

    @PrimaryGeneratedColumn() //i dont know why it is mandatory
	id : number

	@Column(
		{
			update: true,
			nullable: false
		})
    login: string;

	@Column(
		{
			update: true,
			nullable: false
		})
	password : string;

	@Column(
		{
			enum : ["in match", "log in", "log out"],
			default: "log out",
			nullable: false,
		})
	state : string
}
