import { MigrationInterface, QueryRunner } from 'typeorm';
import { hash } from 'bcrypt';

export class InitialSeed1711110000008 implements MigrationInterface {
  name = 'InitialSeed1711110000008';

  private async createPermissions(queryRunner: QueryRunner): Promise<void> {
    const permissions = [
      // Usuarios
      { name: 'users.view', description: 'Ver usuarios' },
      { name: 'users.create', description: 'Crear usuarios' },
      { name: 'users.update', description: 'Actualizar usuarios' },
      { name: 'users.delete', description: 'Eliminar usuarios' },

      // Clientes
      { name: 'clients.view', description: 'Ver clientes' },
      { name: 'clients.create', description: 'Crear clientes' },
      { name: 'clients.update', description: 'Actualizar clientes' },
      { name: 'clients.delete', description: 'Eliminar clientes' },

      // ATMs
      { name: 'atms.view', description: 'Ver ATMs' },
      { name: 'atms.create', description: 'Crear ATMs' },
      { name: 'atms.update', description: 'Actualizar ATMs' },
      { name: 'atms.delete', description: 'Eliminar ATMs' },

      // Tickets
      { name: 'tickets.view', description: 'Ver tickets' },
      { name: 'tickets.create', description: 'Crear tickets' },
      { name: 'tickets.update', description: 'Actualizar tickets' },
      { name: 'tickets.delete', description: 'Eliminar tickets' },
      { name: 'tickets.assign', description: 'Asignar tickets' },
      { name: 'tickets.close', description: 'Cerrar tickets' },

      // Mantenimiento
      { name: 'maintenance.view', description: 'Ver registros de mantenimiento' },
      { name: 'maintenance.create', description: 'Crear registros de mantenimiento' },
      { name: 'maintenance.update', description: 'Actualizar registros de mantenimiento' },

      // SLA
      { name: 'sla.view', description: 'Ver configuraciones SLA' },
      { name: 'sla.manage', description: 'Gestionar configuraciones SLA' },

      // Configuración
      { name: 'settings.view', description: 'Ver configuraciones' },
      { name: 'settings.manage', description: 'Gestionar configuraciones' },

      // Zonas geográficas
      { name: 'zones.view', description: 'Ver zonas geográficas' },
      { name: 'zones.manage', description: 'Gestionar zonas geográficas' },

      // Reportes
      { name: 'reports.view', description: 'Ver reportes' },
      { name: 'reports.export', description: 'Exportar reportes' }
    ];

    for (const permission of permissions) {
      await queryRunner.query(
        `
                INSERT INTO permissions (name, description)
                VALUES ($1, $2)
                ON CONFLICT (name) DO NOTHING
            `,
        [permission.name, permission.description]
      );
    }
  }

  private async createRoles(queryRunner: QueryRunner): Promise<void> {
    // Crear roles
    const roles = [
      {
        name: 'ADMIN',
        description: 'Administrador del sistema con acceso total'
      },
      {
        name: 'TECHNICIAN',
        description: 'Técnico con acceso a tickets y mantenimiento'
      },
      {
        name: 'OPERATOR',
        description: 'Operador con acceso básico'
      }
    ];

    for (const role of roles) {
      await queryRunner.query(
        `
                INSERT INTO roles (name, description)
                VALUES ($1, $2)
                ON CONFLICT (name) DO NOTHING
                RETURNING id
            `,
        [role.name, role.description]
      );
    }

    // Asignar todos los permisos al rol ADMIN
    const adminPermissions = await queryRunner.query(`
            SELECT id FROM permissions
        `);

    const adminRoleId = await queryRunner.query(`
            SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1
        `);

    for (const permission of adminPermissions) {
      await queryRunner.query(
        `
                INSERT INTO roles_permissions (role_id, permission_id)
                VALUES ($1, $2)
                ON CONFLICT (role_id, permission_id) DO NOTHING
            `,
        [adminRoleId[0].id, permission.id]
      );
    }

    // Asignar permisos al rol TECHNICIAN
    const technicianPermissions = [
      'tickets.view',
      'tickets.update',
      'maintenance.view',
      'maintenance.create',
      'maintenance.update',
      'atms.view'
    ];

    const techRoleId = await queryRunner.query(`
            SELECT id FROM roles WHERE name = 'TECHNICIAN' LIMIT 1
        `);

    for (const permName of technicianPermissions) {
      const permId = await queryRunner.query(
        `
                SELECT id FROM permissions WHERE name = $1 LIMIT 1
            `,
        [permName]
      );

      if (permId.length > 0) {
        await queryRunner.query(
          `
                    INSERT INTO roles_permissions (role_id, permission_id)
                    VALUES ($1, $2)
                    ON CONFLICT (role_id, permission_id) DO NOTHING
                `,
          [techRoleId[0].id, permId[0].id]
        );
      }
    }

    // Asignar permisos al rol OPERATOR
    const operatorPermissions = ['tickets.view', 'tickets.create', 'atms.view', 'clients.view'];

    const opRoleId = await queryRunner.query(`
            SELECT id FROM roles WHERE name = 'OPERATOR' LIMIT 1
        `);

    for (const permName of operatorPermissions) {
      const permId = await queryRunner.query(
        `
                SELECT id FROM permissions WHERE name = $1 LIMIT 1
            `,
        [permName]
      );

      if (permId.length > 0) {
        await queryRunner.query(
          `
                    INSERT INTO roles_permissions (role_id, permission_id)
                    VALUES ($1, $2)
                    ON CONFLICT (role_id, permission_id) DO NOTHING
                `,
          [opRoleId[0].id, permId[0].id]
        );
      }
    }
  }

  private async createAdminUser(queryRunner: QueryRunner): Promise<void> {
    const adminRoleId = await queryRunner.query(`
            SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1
        `);

    if (adminRoleId.length === 0) {
      throw new Error('Admin role not found');
    }

    const passwordHash = await hash('DMdr@#2008', 10);

    await queryRunner.query(
      `
            INSERT INTO users (
                email,
                password_hash,
                first_name,
                last_name,
                role,
                is_active
            )
            VALUES (
                'dmiles@grupoefrain.com',
                $1,
                'David',
                'Miles',
                'ADMIN',
                true
            )
            ON CONFLICT (email) DO NOTHING
        `,
      [passwordHash]
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.createPermissions(queryRunner);
    await this.createRoles(queryRunner);
    await this.createAdminUser(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No implementamos down para datos iniciales
  }
}
