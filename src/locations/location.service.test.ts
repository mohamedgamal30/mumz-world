import { Test, TestingModule } from '@nestjs/testing';
import { LocationsService } from './locations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Location } from '../database/entities/location.entity';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateLocationDto } from './dto/create-location.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('LocationsService', () => {
  let service: LocationsService;
  let locationRepository: Repository<Location>;
  let userRepository: Repository<User>;

  const locationEntity = { id: 1, city: 'TestCity', user: { id: 123, username: 'test', password: 'hashed' } } as Location;
  const userEntity = { id: 123, username: 'test', password: 'hashed', locations: [locationEntity] } as User;

  const mockLocationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: getRepositoryToken(Location),
          useValue: mockLocationRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    locationRepository = module.get<Repository<Location>>(getRepositoryToken(Location));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a location successfully', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(userEntity);
      (locationRepository.create as jest.Mock).mockImplementation(dto => ({ ...dto, id: 1 }));
      (locationRepository.save as jest.Mock).mockResolvedValue(locationEntity);

      const dto: CreateLocationDto = { city: 'Paris' };
      const result = await service.create(dto, 123);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 123 }, relations: ['locations'] });
      expect(locationRepository.create).toHaveBeenCalledWith({ city: 'Paris', user: userEntity });
      expect(locationRepository.save).toHaveBeenCalledWith({ city: 'Paris', user: userEntity, id: 1 });
      expect(result).toEqual(locationEntity);
    });

    it('should throw an HttpException if user is not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.create({ city: 'Paris' }, 123))
        .rejects
        .toThrowError(new HttpException('User not found', HttpStatus.NOT_FOUND));

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 123 }, relations: ['locations'] });
      expect(locationRepository.create).not.toHaveBeenCalled();
      expect(locationRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an HttpException if creation fails', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(userEntity);
      (locationRepository.create as jest.Mock).mockImplementation(dto => ({ ...dto, id: 1 }));
      (locationRepository.save as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      await expect(service.create({ city: 'Paris' }, 123))
        .rejects
        .toThrowError(new HttpException('Unable to add location', HttpStatus.INTERNAL_SERVER_ERROR));

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 123 }, relations: ['locations'] });
      expect(locationRepository.create).toHaveBeenCalledWith({ city: 'Paris', user: userEntity });
      expect(locationRepository.save).toHaveBeenCalledWith({ city: 'Paris', user: userEntity, id: 1 });
    });
  });

  describe('findAllByUser', () => {
    it('should return locations for a given user', async () => {
      (locationRepository.find as jest.Mock).mockResolvedValue([locationEntity]);

      const result = await service.findAllByUser(123);
      expect(locationRepository.find).toHaveBeenCalledWith({ where: { user: { id: 123 } } });
      expect(result).toEqual([locationEntity]);
    });

    it('should throw an HttpException if fetching fails', async () => {
      (locationRepository.find as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      await expect(service.findAllByUser(123))
        .rejects
        .toThrowError(new HttpException('Unable to fetch user locations', HttpStatus.INTERNAL_SERVER_ERROR));

      expect(locationRepository.find).toHaveBeenCalledWith({ where: { user: { id: 123 } } });
    });
  });

  describe('remove', () => {
    it('should remove a location if it exists', async () => {
      (locationRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.remove(1, 123);
      expect(locationRepository.delete).toHaveBeenCalledWith({ id: 1, user: { id: 123 } });
    });

    it('should throw NOT_FOUND if no location deleted', async () => {
      (locationRepository.delete as jest.Mock).mockResolvedValueOnce({ affected: 0 });

      await expect(service.remove(2, 123))
        .rejects
        .toThrowError(new HttpException('Location not found', HttpStatus.NOT_FOUND));

      expect(locationRepository.delete).toHaveBeenCalledWith({ id: 2, user: { id: 123 } });
    });

    it('should throw INTERNAL_SERVER_ERROR on DB error', async () => {
      (locationRepository.delete as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      await expect(service.remove(1, 123))
        .rejects
        .toThrowError(new HttpException('Unable to remove location', HttpStatus.INTERNAL_SERVER_ERROR));

      expect(locationRepository.delete).toHaveBeenCalledWith({ id: 1, user: { id: 123 } });
    });
  });

  describe('findAllLocations', () => {
    it('should return all locations', async () => {
      (locationRepository.find as jest.Mock).mockResolvedValue([locationEntity]);
      const result = await service.findAllLocations();
      expect(locationRepository.find).toHaveBeenCalledWith({ relations: ['user'] });
      expect(result).toEqual([locationEntity]);
    });

    it('should throw an HttpException if fetching all fails', async () => {
      (locationRepository.find as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      await expect(service.findAllLocations())
        .rejects
        .toThrowError(new HttpException('Unable to fetch locations', HttpStatus.INTERNAL_SERVER_ERROR));

      expect(locationRepository.find).toHaveBeenCalledWith({ relations: ['user'] });
    });
  });

  describe('updateLocationWeather', () => {
    it('should update weather for a location successfully', async () => {
      const updatedWeather = { temperature: 25, description: 'Sunny' };
      const updatedLocation = { ...locationEntity, weather: updatedWeather };

      (locationRepository.save as jest.Mock).mockResolvedValue(updatedLocation);

      const result = await service.updateLocationWeather(locationEntity, updatedWeather);

      expect(locationRepository.save).toHaveBeenCalledWith({
        ...locationEntity,
        weather: updatedWeather,
      });
      expect(result).toEqual(updatedLocation);
    });

    it('should throw an HttpException if updating weather fails', async () => {
      const updatedWeather = { temperature: 25, description: 'Sunny' };

      (locationRepository.save as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      await expect(service.updateLocationWeather(locationEntity, updatedWeather)).rejects.toThrowError(
        new HttpException('Unable to add location', HttpStatus.INTERNAL_SERVER_ERROR),
      );

      expect(locationRepository.save).toHaveBeenCalledWith({
        ...locationEntity,
        weather: updatedWeather,
      });
    });
  });
});
