import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TablesService } from './tables.service';
import {
  IsInt,
  IsString,
  IsOptional,
  Min,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateTableDto {
  @IsInt()
  @Min(1)
  tableNumber!: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  capacity!: number;

  @IsOptional()
  @IsString()
  section?: string;

  @IsUUID()
  outletId!: string;
}

class UpdateTableDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  tableNumber?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  capacity?: number;

  @IsOptional()
  @IsString()
  section?: string;
}

class UpdateStatusDto {
  @IsEnum(['FREE', 'OCCUPIED', 'BILLING', 'RESERVED'])
  status!: 'FREE' | 'OCCUPIED' | 'BILLING' | 'RESERVED';
}

@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  findAll(
    @Req() req: any,
    @Query('outletId', ParseUUIDPipe) outletId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.tablesService.findAll(
      req.tenantId,
      outletId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.tablesService.findOne(req.tenantId, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateTableDto) {
    return this.tablesService.create(req.tenantId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.tablesService.update(req.tenantId, id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.tablesService.updateStatus(req.tenantId, id, dto.status);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.tablesService.softDelete(req.tenantId, id);
  }
}
