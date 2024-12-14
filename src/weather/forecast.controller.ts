import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Forecast')
@Controller('forecast')
@UseGuards(ThrottlerGuard)
export class ForecastController {
  constructor(private forecastService: ForecastService) {}

  @Get(':city')
  async getForecast(@Param('city') city: string) {
    return this.forecastService.getForecast(city);
  }
}
