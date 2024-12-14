import { Controller, Post, Get, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Locations')
@ApiBearerAuth()
@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a location to current user favorites' })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 409, description: 'Location entered already assigned to the user.' })
  @ApiResponse({ status: 500, description: 'Unexpected error.' })
  @ApiResponse({ status: 201, description: 'Successfully location added for the user favorites.' })
  async addLocation(@Body() createLocationDto: CreateLocationDto, @Req() req: Request) {
    const user = req.user as { userId: number };
    return this.locationsService.create(createLocationDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve favorite locations' })
  @ApiResponse({ status: 500, description: 'Unexpected error.' })
  @ApiResponse({ status: 201, description: 'Successfully returned all user locations.' })
  async findAll(@Req() req: Request) {
    const user = req.user as { userId: number };
    return this.locationsService.findAllByUser(user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a location from favorites' })
  @ApiParam({ name: 'id', description: 'Location ID', required: true })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  @ApiResponse({ status: 500, description: 'Unexpected error.' })
  @ApiResponse({ status: 201, description: 'Successfully location removed for the user favorites.' })
  async remove(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as { userId: number };
    return this.locationsService.remove(id, user.userId);
  }
}
