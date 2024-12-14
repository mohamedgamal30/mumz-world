import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../shared/redis/cache.service';
import { HttpStatus } from '@nestjs/common';

jest.mock('../common/app.constants', () => ({
  OPEN_WEATHER_MAP_DOMAIN: 'https://api.openweathermap.org/data/2.5',
}));

describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: HttpService;
  let cacheService: CacheService;

  const mockHttpService = {
    axiosRef: {
      get: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'OPENWEATHER_API_KEY') return 'test_api_key';
      return null;
    }),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return current weather data from cache if available', async () => {
    const mockCachedData = { weather: 'sunny' };
    mockCacheService.get.mockResolvedValueOnce(mockCachedData);

    const result = await service.getCurrentWeather('London');

    expect(cacheService.get).toHaveBeenCalledWith('weather:london');
    expect(httpService.axiosRef.get).not.toHaveBeenCalled();
    expect(result).toEqual(mockCachedData);
  });

  it('should fetch current weather data from API and cache it when not in cache', async () => {
    const mockApiData = { weather: 'cloudy' };
    mockCacheService.get.mockResolvedValueOnce(null); 
    mockHttpService.axiosRef.get.mockResolvedValueOnce({ data: mockApiData });
    mockCacheService.set.mockResolvedValueOnce(undefined); 

    const result = await service.getCurrentWeather('London');

    expect(cacheService.get).toHaveBeenCalledWith('weather:london');
    expect(httpService.axiosRef.get).toHaveBeenCalledWith(
      'https://api.openweathermap.org/data/2.5/weather?q=London&appid=test_api_key&units=metric'
    );
    expect(cacheService.set).toHaveBeenCalledWith('weather:london', mockApiData);
    expect(result).toEqual(mockApiData);
  });


  it('should throw HttpException on API failure', async () => {
    mockCacheService.get.mockResolvedValueOnce(null); 
    mockHttpService.axiosRef.get.mockRejectedValueOnce(new Error('API error'));

    await expect(service.getCurrentWeather('London')).rejects.toMatchObject({
      message: 'Failed to fetch current weather',
      status: HttpStatus.BAD_REQUEST,
    });

    expect(cacheService.get).toHaveBeenCalledWith('weather:london');
    expect(httpService.axiosRef.get).toHaveBeenCalledWith(
      'https://api.openweathermap.org/data/2.5/weather?q=London&appid=test_api_key&units=metric'
    );
    expect(cacheService.set).not.toHaveBeenCalled(); 
  });
});
