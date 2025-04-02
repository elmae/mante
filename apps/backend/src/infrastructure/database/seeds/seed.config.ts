import config from "../../../config/config";
import { AppDataSource } from "../../../config/database.config";
import Logger from "../../../config/logger.config";
import { Role } from "../../../domain/entities/role.entity";
import { Permission } from "../../../domain/entities/permission.entity";
import { User } from "../../../domain/entities/user.entity";
import * as bcrypt from "bcrypt";

export const initializeSeed = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    Logger.info("Database connected for seeding");
  } catch (error) {
    Logger.error("Error connecting to database:", error);
    throw error;
  }
};

export const seedPermissions = async (): Promise<Permission[]> => {
  const permissionRepository = AppDataSource.getRepository(Permission);

  const defaultPermissions = [
    { name: "manage_users", description: "Gestionar usuarios" },
    { name: "manage_roles", description: "Gestionar roles" },
    { name: "manage_atms", description: "Gestionar ATMs" },
    { name: "manage_tickets", description: "Gestionar tickets" },
    { name: "manage_maintenance", description: "Gestionar mantenimientos" },
    { name: "view_reports", description: "Ver reportes" },
    { name: "manage_zones", description: "Gestionar zonas geográficas" },
    { name: "manage_clients", description: "Gestionar clientes" },
  ];

  const permissions: Permission[] = [];

  for (const permissionData of defaultPermissions) {
    const existingPermission = await permissionRepository.findOneBy({
      name: permissionData.name,
    });

    if (!existingPermission) {
      const permission = permissionRepository.create(permissionData);
      permissions.push(await permissionRepository.save(permission));
      Logger.info(`Permission created: ${permission.name}`);
    } else {
      permissions.push(existingPermission);
    }
  }

  return permissions;
};

export const seedRoles = async (permissions: Permission[]): Promise<Role[]> => {
  const roleRepository = AppDataSource.getRepository(Role);

  const defaultRoles = [
    {
      name: "admin",
      description: "Administrador del sistema",
      permissions: permissions,
    },
    {
      name: "operator",
      description: "Operador del sistema",
      permissions: permissions.filter(
        (p) => !["manage_users", "manage_roles"].includes(p.name)
      ),
    },
    {
      name: "technician",
      description: "Técnico de mantenimiento",
      permissions: permissions.filter((p) =>
        ["manage_tickets", "manage_maintenance"].includes(p.name)
      ),
    },
    {
      name: "client",
      description: "Cliente",
      permissions: permissions.filter((p) => ["view_reports"].includes(p.name)),
    },
  ];

  const roles: Role[] = [];

  for (const roleData of defaultRoles) {
    const existingRole = await roleRepository.findOneBy({
      name: roleData.name,
    });

    if (!existingRole) {
      const role = roleRepository.create(roleData);
      roles.push(await roleRepository.save(role));
      Logger.info(`Role created: ${role.name}`);
    } else {
      roles.push(existingRole);
    }
  }

  return roles;
};

export const seedAdminUser = async (adminRole: Role): Promise<void> => {
  const userRepository = AppDataSource.getRepository(User);

  const adminEmail = config.admin.email || "admin@system.com";
  const existingAdmin = await userRepository.findOneBy({ email: adminEmail });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(
      config.admin.password || "admin123",
      10
    );

    const adminUser = userRepository.create({
      email: adminEmail,
      password_hash: passwordHash,
      first_name: "Admin",
      last_name: "System",
      role: "admin",
      is_active: true,
    });

    await userRepository.save(adminUser);
    Logger.info(`Admin user created: ${adminUser.email}`);
  }
};
