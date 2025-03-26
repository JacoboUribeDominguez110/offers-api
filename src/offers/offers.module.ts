import { forwardRef, Module } from '@nestjs/common';

import { GatewayModule } from 'src/gateway/gateway.module';

import { OffersService } from './offers.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule, forwardRef(() => GatewayModule)],
  providers: [OffersService],
  exports: [OffersService]
})
export class OffersModule {}
