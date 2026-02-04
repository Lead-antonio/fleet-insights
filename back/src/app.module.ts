import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entity/users.entity';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { Role } from './roles/entity/role.entity';
import { Permission } from './permissions/entity/permission.entity';
import { CustomersModule } from './customers/customers.module';
import { VehiculeTypesModule } from './vehicule-types/vehicule-types.module';
import { VehiculesModule } from './vehicules/vehicules.module';
import { Customer } from './customers/entity/customer.entity';
import { VehiculeType } from './vehicule-types/entity/vehicule-type.entity';
import { Vehicule } from './vehicules/entity/vehicule.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // importe ConfigModule pour l’injection
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: +config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'), 
        password: config.get<string>('DB_PASSWORD', ''), 
        database: config.get<string>('DB_DATABASE', ''),
        entities: [User, Role, Permission, Customer, VehiculeType, Vehicule],
        synchronize: true,
      }),
    }),
    AuthModule, UsersModule, RolesModule, PermissionsModule, CustomersModule, VehiculeTypesModule, VehiculesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
