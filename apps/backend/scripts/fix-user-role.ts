import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { join } from 'path';
dotenv.config({ path: join(__dirname, '../../.env') });

// Importar config primero para asegurar carga de variables
import '../src/config/config';
import { User } from '../src/domain/entities/user.entity';
import { Role } from '../src/domain/entities/role.entity';
import AppDataSource from '../src/config/datasource';

async function fixUserRole() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  try {
    // 1. Listar roles disponibles
    const roles = await AppDataSource.getRepository(Role).find();
    console.log('Roles disponibles:');
    console.table(roles.map((r: Role) => ({ id: r.id, name: r.name })));

    // 2. Obtener usuario problemático
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { email: 'dmiles@grupoefrain.com' },
      relations: ['role']
    });

    if (!user) {
      console.error('Usuario no encontrado');
      return;
    }

    console.log('\nUsuario actual:');
    console.table([
      {
        id: user.id,
        email: user.email,
        roleId: user.role?.id || 'null',
        roleName: user.role?.name || 'null'
      }
    ]);

    // 3. Actualizar con rol válido (si se proporciona)
    if (process.argv[2]) {
      const roleId = process.argv[2];
      const role = roles.find((r: Role) => r.id === roleId);
      if (!role) {
        console.error(`\n❌ No se encontró el rol con ID: ${roleId}`);
        return;
      }
      user.role = role;
      await userRepo.save(user);
      console.log(`\n✅ Usuario actualizado con role_id: ${roleId}`);
    } else {
      console.log('\nℹ️ Ejecuta con un role_id válido para actualizar:');
      console.log('npm run fix-user-role [role_id]');
    }
  } finally {
    await AppDataSource.destroy();
  }
}

fixUserRole().catch(console.error);
