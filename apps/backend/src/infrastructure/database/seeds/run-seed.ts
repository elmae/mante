import {
  initializeSeed,
  seedPermissions,
  seedRoles,
  seedAdminUser,
} from "./seed.config";
import Logger from "../../../config/logger.config";
import { AppDataSource } from "../../../config/database.config";

async function runSeed() {
  try {
    // Inicializar conexión a la base de datos
    await initializeSeed();

    // Crear permisos base
    const permissions = await seedPermissions();
    Logger.info(`Created ${permissions.length} permissions`);

    // Crear roles con sus permisos
    const roles = await seedRoles(permissions);
    Logger.info(`Created ${roles.length} roles`);

    // Crear usuario administrador
    const adminRole = roles.find((role) => role.name === "admin");
    if (adminRole) {
      await seedAdminUser(adminRole);
    } else {
      throw new Error("Admin role not found");
    }

    Logger.info("Seed completed successfully");
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    Logger.error("Error running seed:", error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

runSeed();
