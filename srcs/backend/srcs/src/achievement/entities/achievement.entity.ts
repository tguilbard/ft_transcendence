import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("Achievements")
export class AchievementEntity{

	@PrimaryColumn()
	id: number

	@Column({
		nullable: false,
		unique: true
	})
	name: string

	@Column({
		nullable: false
	})
	description: string

	@Column({
		nullable: true
	})
	imageLockName: string

	@Column({
		nullable: true
	})
	imageUnlockName: string
}