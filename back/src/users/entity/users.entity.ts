import { Role } from 'src/roles/entity/role.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToMany } from 'typeorm';

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

  @Column({ type: 'timestamp', nullable: true })
  password_changed_at: Date;

  @ManyToMany(() => Role, role => role.users, { eager: true })
  @JoinTable()
  roles: Role[];

}
