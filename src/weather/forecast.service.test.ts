import { Test, TestingModule } from '@nestjs/testing';
import { ForecastService } from './forecast.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../shared/redis/cache.service';
import { HttpStatus } from '@nestjs/common';

jest.mock('../common/app.constants', () => ({
  OPEN_WEATHER_MAP_DOMAIN: 'https://api.openweathermap.org/data/2.5',
}));

describe('ForecastService', () => {
  let service: ForecastService;
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
        ForecastService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CacheService, useValue: mockCacheService }, 
      ],
    }).compile();

    service = module.get<ForecastService>(ForecastService);
    httpService = module.get<HttpService>(HttpService);
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return forecast data from cache if available', async () => {
    const mockCachedData = { forecast: 'sunny' };
    mockCacheService.get.mockResolvedValueOnce(mockCachedData);

    const result = await service.getForecast('Paris');

    expect(cacheService.get).toHaveBeenCalledWith('forecast:paris');
    expect(httpService.axiosRef.get).not.toHaveBeenCalled();
    expect(result).toEqual(mockCachedData);
  });

  it('should fetch forecast data from API and cache it when not in cache', async () => {
    const mockApiData = { forecast: 'cloudy' }; 
    mockCacheService.get.mockResolvedValueOnce(null);
    mockHttpService.axiosRef.get.mockResolvedValueOnce({ data: mockApiData });
    mockCacheService.set.mockResolvedValueOnce(undefined);

    const result = await service.getForecast('Paris');

    expect(cacheService.get).toHaveBeenCalledWith('forecast:paris');
    expect(httpService.axiosRef.get).toHaveBeenCalledWith(
      'https://api.openweathermap.org/data/2.5/forecast?q=Paris&appid=test_api_key&units=metric'
    );
    expect(cacheService.set).toHaveBeenCalledWith('forecast:paris', mockApiData);
    expect(result).toEqual(mockApiData);
  });

  it('should throw HttpException on API failure', async () => {
    mockCacheService.get.mockResolvedValueOnce(null);
    mockHttpService.axiosRef.get.mockRejectedValueOnce(new Error('API error'));

    await expect(service.getForecast('Paris')).rejects.toMatchObject({
      message: 'Failed to fetch forecast',
      status: HttpStatus.BAD_REQUEST,
    });

    expect(cacheService.get).toHaveBeenCalledWith('forecast:paris');
    expect(httpService.axiosRef.get).toHaveBeenCalledWith(
      'https://api.openweathermap.org/data/2.5/forecast?q=Paris&appid=test_api_key&units=metric'
    );
    expect(cacheService.set).not.toHaveBeenCalled();
  });
});
