import { DataSource } from 'typeorm';
import { Permission } from '../permissions/entity/permission.entity';

export const permissionSeeder = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Permission);

  const permissions = [
    { name: 'dashboard.read',   description: 'Voir le tableau de bord' },
    // ── Users ──────────────────────────────────────────────────────────────
    { name: 'user.read',   description: 'Voir la liste des utilisateurs' },
    { name: 'user.profile',   description: 'Voir le profil d\'un utilisateur' },
    { name: 'user.create', description: 'Créer un utilisateur' },
    { name: 'user.update', description: 'Modifier un utilisateur' },
    { name: 'user.delete', description: 'Supprimer un utilisateur' },

    // ── Roles ───────────────────────────────────────────────────────────────
    { name: 'role.read',   description: 'Voir la liste des rôles' },
    { name: 'role.create', description: 'Créer un rôle' },
    { name: 'role.update', description: 'Modifier un rôle' },
    { name: 'role.delete', description: 'Supprimer un rôle' },

    // ── Permissions ─────────────────────────────────────────────────────────
    { name: 'permission.read',   description: 'Voir la liste des permissions' },
    { name: 'permission.create', description: 'Créer une permission' },
    { name: 'permission.update', description: 'Modifier une permission' },
    { name: 'permission.delete', description: 'Supprimer une permission' },
  ];

  for (const perm of permissions) {
    const exists = await repo.findOne({ where: { name: perm.name } });
    if (!exists) {
      await repo.save(repo.create(perm));
      console.log(`  ✅ Permission créée : ${perm.name}`);
    } else {
      console.log(`  ⏭️  Permission déjà existante : ${perm.name}`);
    }
  }
};