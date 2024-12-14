import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Weather')
@Controller('weather')
@UseGuards(ThrottlerGuard)
export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  @Get(':city')
  @ApiOperation({ summary: 'Get current weather for a city' })
  @ApiParam({ name: 'city', required: true, description: 'City name' })
  @ApiResponse({ status: 400, description: 'Failed to fetch city weather data.' })
  @ApiResponse({ status: 201, description: 'Successfully returned the city weather data.' })
  async getCurrentWeather(@Param('city') city: string) {
    return this.weatherService.getCurrentWeather(city);
  }
}
