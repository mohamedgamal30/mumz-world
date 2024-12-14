import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from '../database/entities/location.entity';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateLocationDto, userId: number): Promise<Location> {
    this.logger.debug(`Attempting to create a location for userId=${userId} with city=${dto.city}`);

    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['locations'] });
    if (!user) {
      this.logger.warn(`User with id=${userId} not found`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const duplicateLocation = user.locations.find((location) => location.city === dto.city);
    if(duplicateLocation){
      this.logger.warn(`Location ${dto.city} already assigned to user with id=${userId}`);
      throw new HttpException('Location already assigned', HttpStatus.CONFLICT);
    }
    
    try {
      const location = this.locationRepository.create({ ...dto, user });
      const savedLocation = await this.locationRepository.save(location);
      this.logger.log(`Successfully created location with id=${savedLocation.id} for userId=${userId}`);
      return savedLocation;
    } catch (error) {
      this.logger.error(`Failed to create location for user ${userId}`);
      throw new HttpException('Unable to add location', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllByUser(userId: number): Promise<Location[]> {
    this.logger.debug(`Fetching all locations for userId=${userId}`);
    try {
      const locations = await this.locationRepository.find({ where: { user: { id: userId } } });
      this.logger.log(`Found ${locations.length} locations for userId=${userId}`);
      return locations;
    } catch (error) {
      this.logger.error(`Failed to fetch locations for userId=${userId}`);
      throw new HttpException('Unable to fetch user locations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    this.logger.debug(`Attempting to remove location id=${id} for userId=${userId}`);
    try {
      const result = await this.locationRepository.delete({ id, user: { id: userId } });
      if (result.affected === 0) {
        this.logger.warn(`No location found with id=${id} for userId=${userId}`);
        throw new HttpException('Location not found', HttpStatus.NOT_FOUND);
      }
      this.logger.log(`Successfully removed location id=${id} for userId=${userId}`);
    } catch (error) {
      this.logger.error(`Failed to remove location id=${id} for userId=${userId}`);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Unable to remove location', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllLocations(): Promise<Location[]> {
    this.logger.debug('Fetching all locations');
    try {
      const locations = await this.locationRepository.find({ relations: ['user'] });
      this.logger.log(`Found ${locations.length} locations`);
      return locations;
    } catch (error) {
      this.logger.error('Failed to fetch all locations');
      throw new HttpException('Unable to fetch locations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateLocationWeather(location: Location, weather: any): Promise<Location> {
    try {
      location.weather = weather;
      const savedLocation = await this.locationRepository.save(location);
      this.logger.log(`Successfully updated updated weather fo location: ${location.city}`);
      return savedLocation;
    } catch (error) {
      this.logger.log(`Failed to update weather for location: ${location.city}`);
      throw new HttpException('Unable to add location', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
