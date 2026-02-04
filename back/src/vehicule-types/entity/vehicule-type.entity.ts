import { BaseEntity } from "src/common/entity/base.entity";
import { Vehicule } from "src/vehicules/entity/vehicule.entity";
import { Entity } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { OneToMany } from "typeorm/decorator/relations/OneToMany";

@Entity('vehicule_types')
export class VehiculeType extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    label: string;

    @OneToMany(() => Vehicule, vehicule => vehicule.type)
    vehicules: Vehicule[];
}
