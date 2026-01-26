import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  full_name?: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false})
  is_active: boolean;
}
