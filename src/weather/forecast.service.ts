import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { OPEN_WEATHER_MAP_DOMAIN } from '../common/app.constants';
import { CacheService } from '../shared/redis/cache.service';

@Injectable()
export class ForecastService {
  private readonly logger = new Logger(ForecastService.name);
  private readonly apiKey: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private cacheService: CacheService
  ) {
    this.apiKey = this.configService.get<string>('OPENWEATHER_API_KEY') || '';
  }

  async getForecast(city: string): Promise<any> {
    try {
      const cacheKey = `forecast:${city.toLowerCase()}`;
      const cachedForecast = await this.cacheService.get(cacheKey);

      if (cachedForecast) {
        this.logger.debug(`Cache - Forecast data for city ${city}`);
        return cachedForecast;
      }

      this.logger.debug(`API Request - Forecast data for city ${city}`);
      const { data } = await this.httpService.axiosRef.get(
        `${OPEN_WEATHER_MAP_DOMAIN}/forecast?q=${city}&appid=${this.apiKey}&units=metric`
      );

      await this.cacheService.set(cacheKey, data);
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch forecast for ${city}: ${error.message}`);
      throw new HttpException('Failed to fetch forecast', HttpStatus.BAD_REQUEST);
    }
  }
}
