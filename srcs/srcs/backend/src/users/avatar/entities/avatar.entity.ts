import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
 
@Entity('avatar')
class AvatarEntity {
 @PrimaryGeneratedColumn()
  public id: number;
 
  @Column()
  filename: string;
 
  @Column({
    type: 'bytea',
  })
  public data: Buffer;
}
 
export default AvatarEntity;