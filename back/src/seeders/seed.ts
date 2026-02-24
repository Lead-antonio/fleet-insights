import { DataSource } from 'typeorm';
import { User } from '../users/entity/users.entity';
import { Role } from '../roles/entity/role.entity';
import { Permission } from '../permissions/entity/permission.entity';
import { permissionSeeder } from './permission.seeder';
import { roleSeeder } from './role.seeder';
import { userSeeder } from './user.seeder';

// ── Config DataSource autonome (hors NestJS) ─────────────────────────────────
const AppDataSource = new DataSource({
  type:        'mysql',
  host:        process.env.DB_HOST     ?? 'localhost',
  port:        Number(process.env.DB_PORT) || 3306,
  username:    process.env.DB_USERNAME ?? 'root',
  password:    process.env.DB_PASSWORD ?? '',
  database:    process.env.DB_DATABASE     ?? 'fleet_master',
  entities:    [User, Role, Permission],
  synchronize: false, // ne jamais mettre true en prod
});

const run = async () => {
  console.log('\n🌱 Démarrage du seeder...\n');

  await AppDataSource.initialize();
  console.log('🔗 Connexion MySQL établie\n');

  console.log('📦 Seeding permissions...');
  await permissionSeeder(AppDataSource);

  console.log('\n📦 Seeding rôles...');
  await roleSeeder(AppDataSource);

  console.log('\n📦 Seeding utilisateurs...');
  await userSeeder(AppDataSource);

  await AppDataSource.destroy();
  console.log('\n✅ Seeder terminé avec succès !\n');
};

run().catch((err) => {
  console.error('❌ Erreur lors du seeder :', err);
  process.exit(1);
});