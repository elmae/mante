import { RedisService } from '../../../../infrastructure/redis/redis.service';

export class TokenBlacklistService {
  private readonly prefix = 'blacklist:token:';

  constructor(private readonly redisService: RedisService) {}

  async addToBlacklist(token: string, expiresIn: number): Promise<void> {
    const key = this.getKey(token);
    await this.redisService.set(key, '1', expiresIn);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const key = this.getKey(token);
    const exists = await this.redisService.exists(key);
    return exists === 1;
  }

  private getKey(token: string): string {
    return `${this.prefix}${token}`;
  }
}
