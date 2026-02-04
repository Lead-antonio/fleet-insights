import { BaseEntity } from "src/common/entity/base.entity";
import { FuelType } from "src/common/enums/fuel-type.enum";
import { Customer } from "src/customers/entity/customer.entity";
import { VehiculeType } from "src/vehicule-types/entity/vehicule-type.entity";
import { Column, Decimal128, Entity, ManyToOne } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";

@Entity('vehicules')
export class Vehicule extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    matricule: string;

    @Column({ nullable: true })
    photo_url: string;
    
    @Column({ nullable: true })
    brand: string;

    @Column({ nullable: true })
    model: string;

    @Column({ nullable: true })
    year: number;
    
    @Column({
        type: 'enum',
        enum: FuelType,
        default: FuelType.GASOIL,
    })
    fuel_type: FuelType;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
    })
    tank_capacity: Decimal128;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
    })
    odometer: Decimal128;

    @ManyToOne(() => Customer, customer => customer.vehicules, { eager: true })
    customer: Customer;

    @ManyToOne(() => VehiculeType, type => type.vehicules, { eager: true })
    type: VehiculeType;
}
