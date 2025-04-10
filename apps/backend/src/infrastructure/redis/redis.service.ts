import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', err => console.error('Redis Client Error', err));
    this.connect();
  }

  private async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async set(key: string, value: string, expiresIn?: number): Promise<void> {
    if (expiresIn) {
      await this.client.set(key, value, { EX: expiresIn });
    } else {
      await this.client.set(key, value);
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
