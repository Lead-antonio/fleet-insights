import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entity/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { PermissionsService } from 'src/permissions/permissions.service';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), PermissionsModule],
  providers: [RolesService, PermissionsService],
  controllers: [RolesController],
  exports: [RolesService, TypeOrmModule]
})
export class RolesModule {}
