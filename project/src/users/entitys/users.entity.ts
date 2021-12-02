import {
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  OneToOne

} from 'typeorm';

import DatabaseFile from "../../Photo/databaseFile.entity"


@Entity('users')
export class UsersEntity {

@PrimaryGeneratedColumn()
  index: number;

  @Column({ type: 'boolean', default: false })
  enableTwoFactorAuth: boolean;

  @Column({ nullable: true })
  twoFactorAuthSecret: string;

  @Column({ type: 'varchar', length: 15, unique: true })
  userID: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  nickname: string;

  @Column({ type: 'int', default: 3000 })
  ladderRating: number;

  @Column({ type: 'int', default: 0 })
  totalWin: number;

  @Column({ type: 'int', default: 0 })
  totalLose: number;

  // default status set
  @Column({ default: 'login' })
  userState: string;

  // notMatched : queue에 넣지 않은 상태
  // waiting: queue 에서 기다리는 중
  // matched: matching 된 상태
  @Column({ type: 'varchar', default: 'notMatched' })
  isMatched: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

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
