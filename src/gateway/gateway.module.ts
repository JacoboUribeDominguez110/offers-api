import { forwardRef, Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';

import { AuthModule } from 'src/auth/auth.module';
import { RedisModule } from 'src/redis/redis.module';

import { OffersModule } from 'src/offers/offers.module';

@Module({
  imports: [AuthModule, RedisModule, forwardRef(() => OffersModule)],
  providers: [AppGateway],
  exports: [AppGateway]
})
export class GatewayModule {}
