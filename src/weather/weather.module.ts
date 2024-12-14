import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ForecastService } from './forecast.service';
import { WeatherController } from './weather.controller';
import { ForecastController } from './forecast.controller';
import { HttpModule } from '@nestjs/axios';
import { WeatherResolver } from './weather.resolver';

@Module({
  imports: [HttpModule],
  providers: [WeatherService, ForecastService, WeatherResolver],
  controllers: [WeatherController, ForecastController],
  exports: [WeatherService, ForecastService]
})
export class WeatherModule {}
