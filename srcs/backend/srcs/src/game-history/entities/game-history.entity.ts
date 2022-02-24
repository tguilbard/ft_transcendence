import { UserEntity } from "src/users/entities/users.entity";
import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('GameHistory')
export class MatchEntity
{
	@PrimaryGeneratedColumn()
	id : number;

	@Column({
		nullable: false,
		default : 0
	})
	scoreUser1: number;

	@Column({
		nullable: false,
		default : 0
	})
	scoreUser2: number;

	@Column({
		nullable: false,
		enum: ["classic", "bonus"],
		default : "classic"
	})
	type: string;

	@ManyToOne(type => UserEntity, (user) => user.history, {
		nullable: false
	})
	user1: UserEntity

	@ManyToOne(type => UserEntity, (user) => user.history, {
		nullable: false
	})
	user2: UserEntity
}