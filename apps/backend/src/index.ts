import { createApp } from './app';
import { config } from './config/config';
import { getDataSource, closeDatabase } from './config/database.config';

async function main() {
  try {
    // Inicializar la conexión a la base de datos
    const dataSource = await getDataSource();

    // Crear la aplicación Express con la conexión a la base de datos
    const app = await createApp(dataSource);

    // Iniciar el servidor
    app.listen(config.port, () => {
      console.log(`🚀 Servidor iniciado en http://localhost:${config.port}`);
      console.log(`🌍 Ambiente: ${config.env}`);
      console.log(`🔑 API Base URL: ${config.apiPrefix}`);
    });

    // Manejo de señales de terminación
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach(signal => {
      process.on(signal, async () => {
        console.log(`\n${signal} recibido. Cerrando servidor...`);
        await closeDatabase();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

main();
