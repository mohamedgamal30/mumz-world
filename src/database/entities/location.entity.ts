import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  city: string;

  @ManyToOne(() => User, user => user.locations, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'json', nullable: true })
  weather: any;
}
