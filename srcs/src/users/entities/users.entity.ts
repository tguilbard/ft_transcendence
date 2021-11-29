import { isUUID } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('Users')
export class UserEntity {

    @PrimaryGeneratedColumn() //i dont know why it is mandatory
	id : number

	@Column(
		{
			update: true,
			nullable: true
		})
    login: string;

	@Column(
		{
			update: false,
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
