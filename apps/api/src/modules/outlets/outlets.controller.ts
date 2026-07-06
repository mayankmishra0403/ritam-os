import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OutletsService } from './outlets.service';
import {
  IsString,
  IsOptional,
  IsObject,
  MinLength,
} from 'class-validator';

class CreateOutletDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  gstin?: string;

  @IsOptional()
  @IsString()
  fssai?: string;
}

class UpdateOutletDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  gstin?: string;

  @IsOptional()
  @IsString()
  fssai?: string;
}

class UpdateSettingsDto {
  @IsObject()
  settings!: Record<string, any>;
}

@UseGuards(AuthGuard('jwt'))
@Controller('outlets')
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.outletsService.findAll(req.tenantId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateOutletDto) {
    return this.outletsService.create(req.tenantId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOutletDto,
  ) {
    return this.outletsService.update(req.tenantId, id, dto);
  }

  @Patch(':id/settings')
  updateSettings(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.outletsService.updateSettings(req.tenantId, id, dto.settings);
  }
}
