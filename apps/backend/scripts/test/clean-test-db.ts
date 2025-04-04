import { createTestDatabase, clearDatabase, closeDatabase } from "../../tests/utils/database-test.utils";
import { DataSource } from "typeorm";

async function cleanTestDb() {
  let connection: DataSource | null = null;
  
  try {
    console.log("🧹 Iniciando limpieza de base de datos de pruebas...");
    
    // Conectar a la base de datos de pruebas
    connection = await createTestDatabase();
    
    // Limpiar todas las tablas
    await clearDatabase(connection);
    
    console.log("✅ Base de datos de pruebas limpiada exitosamente");
    console.log(`📊 Database: ${process.env.TEST_DB_NAME}`);
    
  } catch (error) {
    console.error("❌ Error limpiando la base de datos de pruebas:", error);
    process.exit(1);
    
  } finally {
    if (connection) {
      await closeDatabase(connection);
      console.log("🔒 Conexión cerrada");
    }
  }
}

// Ejecutar la limpieza
cleanTestDb().catch((error) => {
  console.error("Error inesperado:", error);
  process.exit(1);
});