import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: UserDto })
  @ApiResponse({ status: 201, description: 'User successfully logged in.' })
  @ApiResponse({ status: 401, description: 'User entered invalid credentials.' })
  async login(@Body() body: UserDto) {
    return this.authService.login(body);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: UserDto })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 409, description: 'Username already exists.' })
  async register(@Body() createUserDto: UserDto) {
      return this.authService.register(createUserDto);
  }
}
