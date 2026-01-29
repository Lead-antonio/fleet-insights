import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { In } from 'typeorm/find-options/operator/In';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Repository } from 'typeorm/repository/Repository';
import { CreateRoleDto } from './dtos/create-role.dto';
import { Permission } from 'src/permissions/entity/permission.entity';
import { Role } from './entity/role.entity';

@Injectable()
export class RolesService {
    constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async create(dto: CreateRoleDto) {
    const exists = await this.roleRepo.findOne({
      where: { name: dto.name },
    });

    if (exists) {
      throw new ConflictException('Role already exists');
    }

    const role = this.roleRepo.create({
      name: dto.name
    });

    if (dto.permissionIds?.length) {
        const permissions = await this.permissionRepo.findBy({
        id: In(dto.permissionIds),
        });

        if (permissions.length !== dto.permissionIds.length) {
        throw new BadRequestException('Some permissions do not exist');
        }

        role.permissions = permissions;
    }

    return this.roleRepo.save(role);
  }

  findAll() {
    return this.roleRepo.find({ relations: ['permissions'] });
  }

  async findOne(id: number) {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.findOne(id);

    if (dto.permissionIds) {
      role.permissions = await this.permissionRepo.findBy({
        id: In(dto.permissionIds),
      });
    }

    if (dto.name) role.name = dto.name;

    return this.roleRepo.save(role);
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    return this.roleRepo.remove(role);
  }
}
