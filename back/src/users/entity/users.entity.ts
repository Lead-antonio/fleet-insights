import { BaseEntity } from 'src/common/entity/base.entity';
import { Role } from 'src/roles/entity/role.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';

@Entity('users')
export class User extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  number?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  state?: string;

  @Column()
  password: string;

  @Column({ default: false})
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  password_changed_at: Date;

  @ManyToOne(() => Role, { eager: true, nullable: true })
  @JoinColumn()
  role: Role;
}
