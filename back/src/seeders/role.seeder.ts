import { DataSource } from 'typeorm';
import { Role } from '../roles//entity/role.entity';
import { Permission } from '../permissions/entity/permission.entity';

export const roleSeeder = async (dataSource: DataSource) => {
  const roleRepo       = dataSource.getRepository(Role);
  const permissionRepo = dataSource.getRepository(Permission);

  // Récupère toutes les permissions déjà seedées
  const allPerms = await permissionRepo.find();

  const getPerms = (...names: string[]) =>
    allPerms.filter((p) => names.includes(p.name));

  const roles = [
    {
      name: 'Administrateur',
      // L'admin a toutes les permissions
      permissions: allPerms,
    },
    {
      name: 'Manager',
      permissions: getPerms(
        'dashboard.read',
        'user.read', 'user.create', 'user.update',
        'role.read',
        'permission.read',
      ),
    },
    {
      name: 'Utilisateur',
      permissions: getPerms(
        'dashboard.read',
        'user.profile',
      ),
    },
  ];

  for (const roleData of roles) {
    const exists = await roleRepo.findOne({ where: { name: roleData.name } });
    if (!exists) {
      const role        = roleRepo.create({ name: roleData.name });
      role.permissions  = roleData.permissions;
      await roleRepo.save(role);
      console.log(`  ✅ Rôle créé : ${roleData.name} (${roleData.permissions.length} permissions)`);
    } else {
      console.log(`  ⏭️  Rôle déjà existant : ${roleData.name}`);
    }
  }
};