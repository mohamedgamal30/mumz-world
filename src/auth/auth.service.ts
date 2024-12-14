import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user){
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        const { password, ...result } = user;
        return result;
      }
  }
    return null;
  }

  async register(user: UserDto){
    return await this.usersService.create(user);
  }

  async login(userDto: UserDto): Promise<{ access_token: string }> {
    const { username, password } = userDto;
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }
}
