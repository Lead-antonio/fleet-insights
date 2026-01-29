// src/permissions/permission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from '../../roles/entity/role.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // ex: "user.create"

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}
