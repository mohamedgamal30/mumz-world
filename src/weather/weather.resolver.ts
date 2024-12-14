import { Resolver, Query, Args, ObjectType, Field, Float } from '@nestjs/graphql';
import { WeatherService } from './weather.service';
import { ForecastService } from './forecast.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { GqlThrottlerGuard } from '../auth/gql-throttle.guard';

@Resolver()
export class WeatherResolver {
  constructor(
    private weatherService: WeatherService,
    private forecastService: ForecastService
  ) {}

  @UseGuards(GqlAuthGuard)
  @UseGuards(GqlThrottlerGuard)
  @Query(() => WeatherType)
  async currentWeather(@Args('city') city: string) {
    const data = await this.weatherService.getCurrentWeather(city);
    return {
      city: data.name,
      temperature: data.main.temp,
      description: data.weather[0].description
    };
  }

  @UseGuards(GqlAuthGuard)
  @UseGuards(GqlThrottlerGuard)
  @Query(() => [ForecastItemType])
  async forecast(@Args('city') city: string) {
    const data = await this.forecastService.getForecast(city);
    return data.list.map(item => ({
      date: item.dt_txt,
      temperature: item.main.temp,
      description: item.weather[0].description
    }));
  }
}

@ObjectType()
class WeatherType {
  @Field()
  city: string;

  @Field(() => Float)
  temperature: number;

  @Field()
  description: string;
}

@ObjectType()
class ForecastItemType {
  @Field()
  date: string;

  @Field(() => Float)
  temperature: number;

  @Field()
  description: string;
}
