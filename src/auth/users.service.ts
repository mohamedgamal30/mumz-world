import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async create(userDto: UserDto): Promise<Omit<User, 'password'>> {
    const { username, password } = userDto;

    const existingUser = await this.usersRepo.findOne({ where: { username } });
    if (existingUser) {
      this.logger.warn(`Registration failed: Username ${username} already exists`);
      throw new HttpException('Username already exists', HttpStatus.CONFLICT);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.usersRepo.create({ username, password: hashedPassword });
    await this.usersRepo.save(user);

    this.logger.log(`Successfully registered user with username=${username}`);

    const { password: _, ...result } = user;
    return result;
  }

  async findByUsername(username: string): Promise<User|null> {
    return await this.usersRepo.findOne({ where: { username } });
  }
}
  