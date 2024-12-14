import { Global, Module } from '@nestjs/common';
import { CacheService } from './redis/cache.service';

@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class SharedModule {}
