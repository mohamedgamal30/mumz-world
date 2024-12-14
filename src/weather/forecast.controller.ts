import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Forecast')
@Controller('forecast')
@UseGuards(ThrottlerGuard)
export class ForecastController {
  constructor(private forecastService: ForecastService) {}

  @Get(':city')
  @ApiParam({ name: 'city', required: true, description: 'City name' })
  @ApiResponse({ status: 400, description: 'Failed to fetch city forecast data.' })
  @ApiResponse({ status: 201, description: 'Successfully returned the city forecast data.' })
  async getForecast(@Param('city') city: string) {
    return this.forecastService.getForecast(city);
  }
}
