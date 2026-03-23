import { BaseEntity } from 'src/common/entity/base.entity';
import { Vehicule } from 'src/vehicules/entity/vehicule.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity('gps')
export class Gps extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column('double')
  latitude: number;

  @Column('double')
  longitude: number;

  @Column({ default: false})
  status: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_connection: Date;

  @OneToOne(() => Vehicule, (vehicule) => vehicule.id, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn() 
  vehicule?: Vehicule;
}