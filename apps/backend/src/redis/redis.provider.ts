import { Injectable } from '@nestjs/common';
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisProvider implements OnModuleInit, OnModuleDestroy {
  readonly client: Redis;

  constructor() {
    const host = process.env.REDIS_HOST;
    const port = Number(process.env.REDIS_PORT ?? 6379);
    const password = process.env.REDIS_PASSWORD;

    if (!host) {
      throw new Error('REDIS_HOST is not set');
    }
    if (!password) {
      throw new Error('REDIS_PASSWORD is not set');
    }

    this.client = new Redis({
      host,
      port,
      password,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
