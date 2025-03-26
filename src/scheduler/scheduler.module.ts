import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from 'src/redis/redis.module';

import { OffersService } from 'src/offers/offers.service';
import { SchedulerService } from './scheduler.service';
import { GatewayModule } from 'src/gateway/gateway.module';

@Module({
  imports: [AuthModule, RedisModule, GatewayModule],
  providers: [SchedulerService, OffersService],
})
export class SchedulerModule {}
