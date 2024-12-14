import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from '../database/entities/location.entity';
import { LocationsJob } from './locations.job';
import { WeatherModule } from '../weather/weather.module';
import { LocationsController } from './location.controller';
import { LocationsResolver } from './locations.resolver';
import { LocationsService } from './locations.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Location]), WeatherModule, AuthModule],
  providers: [LocationsService, LocationsResolver, LocationsJob],
  controllers: [LocationsController],
  exports: [LocationsService]
})
export class LocationsModule {}
