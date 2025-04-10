import { createApp } from './app';
import { config } from './config/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

const startServer = async () => {
  try {
    // Configurar la conexión a la base de datos
    const dataSource = new DataSource({
      type: 'postgres',
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      database: config.database.database,
      entities: [join(__dirname, './domain/entities/*.entity{.ts,.js}')],
      synchronize: config.database.synchronize,
      logging: config.database.logging
    });

    // Inicializar la conexión a la base de datos
    await dataSource.initialize();
    console.log('🗄️  Conexión a base de datos establecida');

    // Crear la aplicación Express
    const app = await createApp();

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

        // Cerrar conexión a la base de datos
        await dataSource.destroy();
        console.log('🗄️  Conexión a base de datos cerrada');

        // Salir del proceso
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
