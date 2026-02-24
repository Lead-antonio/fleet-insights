import { DataSource } from 'typeorm';
import { User } from '../users/entity/users.entity';
import { Role } from '../roles//entity/role.entity';
import * as bcrypt from 'bcrypt';

export const userSeeder = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  const adminRole   = await roleRepo.findOne({ where: { name: 'Administrateur' } });
  const managerRole = await roleRepo.findOne({ where: { name: 'Manager' } });
  const userRole    = await roleRepo.findOne({ where: { name: 'Utilisateur' } });

  const users: Array<{
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    country?: string;
    state?: string;
    number?: string;
    role: Role | undefined;
  }> = [
    {
      email:      'nomenandrianinaantonio@gmail.com',
      password:   'azerty',
      first_name: 'Antonio',
      last_name:  'Nomenandrianina',
      is_active:  false,
      country: 'Madagascar',
      state: 'Andoharanofotsy',
      number: '034 62 152 42',
      role:       adminRole ?? undefined,
    },
    {
      email:      'manager@app.com',
      password:   'Manager@1234',
      first_name: 'John',
      last_name:  'Manager',
      is_active:  false,
      country: 'Madagascar',
      state: 'Analamanga',
      number: '032 12 345 67',
      role:       managerRole ?? undefined,
    },
    {
      email:      'user@app.com',
      password:   'User@1234',
      first_name: 'Jane',
      last_name:  'User',
      is_active:  false,
      country: 'Madagascar',
      state: 'Analakely',
      number: '033 98 765 43',
      role:       userRole ?? undefined,
    },
  ];

  for (const userData of users) {
    const exists = await userRepo.findOne({ where: { email: userData.email } });
    if (!exists) {
      const hashed = await bcrypt.hash(userData.password, 10);
      const { password: _plain, ...rest } = userData;
      const user = userRepo.create({ ...rest, password: hashed });
      await userRepo.save(user);
      console.log(`  ✅ Utilisateur créé : ${userData.email} (rôle: ${userData.role?.name})`);
    } else {
      console.log(`  ⏭️  Utilisateur déjà existant : ${userData.email}`);
    }
  }
};