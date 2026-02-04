import { BaseEntity } from "src/common/entity/base.entity";
import { Vehicule } from "src/vehicules/entity/vehicule.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('customers')
export class Customer extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ nullable: false })
    name?: string;

    @Column({ unique: true, nullable: false })
    email?: string;

    @Column({ unique: true, nullable: false })
    phone?: string;

    @Column({ nullable: true })
    description: string;

    @Column({unique: true, nullable: true})
    api_key: string;

    @OneToMany(() => Vehicule, vehicule => vehicule.customer)
    vehicules: Vehicule[];
}
