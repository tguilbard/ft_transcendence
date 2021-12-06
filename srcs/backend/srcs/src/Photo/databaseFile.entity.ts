import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
 
@Entity('photo')
class DatabaseFile {
 @PrimaryGeneratedColumn()
  public id: number;
 
  @Column()
  filename: string;
 
  @Column({
    type: 'bytea',
  })
  public data: Buffer;
}
 
export default DatabaseFile;