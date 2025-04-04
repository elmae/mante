import { createTestDatabase, closeDatabase } from "../../tests/utils/database-test.utils";
import { DataSource } from "typeorm";

async function initTestDb() {
  let connection: DataSource | null = null;
  
  try {
    console.log("🚀 Iniciando configuración de base de datos de pruebas...");
    
    // Crear y conectar a la base de datos de pruebas
    connection = await createTestDatabase();
    
    console.log("✅ Base de datos de pruebas configurada exitosamente");
    console.log(`📊 Database: ${process.env.TEST_DB_NAME}`);
    console.log(`🔌 Host: ${process.env.TEST_DB_HOST}`);
    console.log(`🔑 User: ${process.env.TEST_DB_USER}`);
    
  } catch (error) {
    console.error("❌ Error configurando la base de datos de pruebas:", error);
    process.exit(1);
    
  } finally {
    if (connection) {
      await closeDatabase(connection);
      console.log("🔒 Conexión cerrada");
    }
  }
}

// Ejecutar la inicialización
initTestDb().catch((error) => {
  console.error("Error inesperado:", error);
  process.exit(1);
});