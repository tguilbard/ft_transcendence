import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('Users')
export class UsersEntity {

    @PrimaryGeneratedColumn()
    login: string;

	@Column()
	password : string;
}
