import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', err => {
      console.error('❌ Redis Client Error:', err);
      throw err; // Propagar el error para manejarlo arriba
    });
  }

  private async connect(): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
        console.log('✅ Conexión Redis establecida');
      }
    } catch (error) {
      console.error('❌ Error conectando a Redis:', error);
      throw error;
    }
  }

  async ensureConnection(): Promise<void> {
    if (!this.client.isOpen) {
      await this.connect();
    }
  }

  async set(key: string, value: string, expiresIn?: number): Promise<void> {
    await this.ensureConnection();
    try {
      if (expiresIn) {
        await this.client.set(key, value, { EX: expiresIn });
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('❌ Error en Redis set:', error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }
}
