import { Module } from '@nestjs/common';
import { RedisModule as IoRedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from './redis.service';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
const REDIS_PORT = process.env.REDIS_PORT || '6379'

@Module({
  imports: [
    IoRedisModule.forRoot({
      type: 'single',
      url: `redis://${REDIS_HOST}:${REDIS_PORT}`
    })
  ],
  exports: [RedisService],
  providers: [RedisService],
})
export class RedisModule {}
