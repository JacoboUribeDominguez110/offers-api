import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';

import RedisKeys from './keys/redis.keys';

@Injectable()
export class RedisService extends RedisKeys {
  constructor(@InjectRedis() private redis: Redis) {
    super()
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, 'EX', ttl);
    } else {
      await this.redis.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async hmset(key: string, userData: any, ttl?: number) {
    await this.redis.hmset(key, userData);
    if(ttl){
      await this.redis.expire(key, ttl)
    }
  }

  async hgetall(key: string): Promise<any> {
    return await this.redis.hgetall(key);
  }

  async hdel(key: string, field: string) {
    await this.redis.hdel(key, field);
  }

  async smembers(key: string) {
    return await this.redis.smembers(key);
  }

  async zrangebyscore(key: string, condition: string, now: number) {
    return await this.redis.zrangebyscore(key, condition, now);
  }

  async zremrangebyscore(key: string, condition: string, now: number) {
    return await this.redis.zremrangebyscore(key, condition, now);
  }

  async sadd(key: string, value: any) {
    await this.redis.sadd(key, value);
  }

  async zadd(key: string, startAt: number, id: any) {
    await this.redis.zadd(key, startAt, id);
  }

  async srem(key: string, value?: any) {
    if(value){
      await this.redis.srem(key, value);
      return;
    }
    await this.redis.srem(key);
  }
  
  async zrem(key: string, value?: any) {
    if(value){
      await this.redis.zrem(key, value);
      return;
    }
    await this.redis.zrem(key);
  }

  async watch(key: string) {
    await this.redis.watch(key);
  }

  async unwatch() {
    await this.redis.unwatch();
  }
  multi() {
    return this.redis.multi();
  }

  async getClient() {
    return this.redis;
  }
}
