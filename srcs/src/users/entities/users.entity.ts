import { Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('Users')
export class UsersEntity {

    @PrimaryGeneratedColumn()
    id: number;
}
