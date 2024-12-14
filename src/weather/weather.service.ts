import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { OPEN_WEATHER_MAP_DOMAIN } from '../common/app.constants';
import { CacheService } from '../shared/redis/cache.service';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private cacheService: CacheService
  ) {
    this.apiKey = this.configService.get<string>('OPENWEATHER_API_KEY');
  }

  async getCurrentWeather(city: string): Promise<any> {
    try {
      const cacheKey = `weather:${city.toLowerCase()}`;
      const cachedWeather = await this.cacheService.get(cacheKey);

      if (cachedWeather) {
        this.logger.debug(`Cache - Weather data for city ${city}`);
        return cachedWeather;
      }

      this.logger.debug(`API Request - Weather data for city ${city}`);
      const { data } = await this.httpService.axiosRef.get(
        `${OPEN_WEATHER_MAP_DOMAIN}/weather?q=${city}&appid=${this.apiKey}&units=metric`
      );

      await this.cacheService.set(cacheKey, data);
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch weather for ${city}: ${error.message}`);
      throw new HttpException('Failed to fetch current weather', HttpStatus.BAD_REQUEST);
    }
  }
}
