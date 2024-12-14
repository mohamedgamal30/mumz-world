import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LocationsService } from './locations.service';
import { WeatherService } from '../weather/weather.service';
import { CacheService } from '../shared/redis/cache.service';

@Injectable()
export class LocationsJob {
  private readonly logger = new Logger(LocationsJob.name);

  constructor(
    private locationsService: LocationsService,
    private weatherService: WeatherService,
    private cacheService: CacheService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async updateLocationsWeather() {
    try {
      const locations = await this.locationsService.findAllLocations();

      for (const location of locations) {
        const weatherData = await this.weatherService.getCurrentWeather(location.city);
        await this.locationsService.updateLocationWeather(location, weatherData);

        const cacheKey = `weather:${location.city}`;
        await this.cacheService.del(cacheKey);
        await this.cacheService.set(cacheKey, weatherData);

        this.logger.log(`Updated weather for ${location.city}`);
      }

      this.logger.debug('Weather update job completed successfully');
    } catch (error) {
      this.logger.error('Error during weather update job', error.stack);
    }
  }
}
