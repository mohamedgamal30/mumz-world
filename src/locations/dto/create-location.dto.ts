import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ description: 'Name of the city to add to favorites', example: 'London' })
  @IsString()
  @IsNotEmpty()
  city: string;
}
