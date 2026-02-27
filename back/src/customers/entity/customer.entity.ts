import { BaseEntity } from "src/common/entity/base.entity";
import { User } from "src/users/entity/users.entity";
import { Vehicule } from "src/vehicules/entity/vehicule.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('customers')
export class Customer extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ nullable: false })
    name?: string;

    @Column({ nullable: true })
    company: string;

    @Column({ nullable: true })
    description: string;

    @Column({unique: true, nullable: true})
    api_key: string;

    @OneToOne(() => User, (user) => user.customer)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Vehicule, vehicule => vehicule.customer)
    vehicules: Vehicule[];
}
