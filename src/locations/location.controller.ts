import { Controller, Post, Get, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Locations')
@ApiBearerAuth()
@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a location to favorites' })
  @ApiBody({ type: CreateLocationDto })
  async addLocation(@Body() createLocationDto: CreateLocationDto, @Req() req: Request) {
    const user = req.user as { userId: number };
    return this.locationsService.create(createLocationDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve favorite locations' })
  async findAll(@Req() req: Request) {
    const user = req.user as { userId: number };
    return this.locationsService.findAllByUser(user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a location from favorites' })
  @ApiParam({ name: 'id', description: 'Location ID', required: true })
  async remove(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as { userId: number };
    return this.locationsService.remove(id, user.userId);
  }
}
