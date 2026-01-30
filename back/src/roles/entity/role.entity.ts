// src/roles/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from '../../permissions/entity/permission.entity';
import { User } from '../../users/entity/users.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // ex: "ADMIN"

  @ManyToMany(() => Permission, permission => permission.roles, { eager: true })
  @JoinTable()
  permissions: Permission[];
}
