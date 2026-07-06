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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from './categories.service';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateCategoryDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  nameHi?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;

  @IsString()
  outletId!: string;
}

class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nameHi?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}

@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(
    @Req() req: any,
    @Query('outletId') outletId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.categoriesService.findAll(
      req.tenantId,
      outletId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.tenantId, dto);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.categoriesService.softDelete(req.tenantId, id);
  }
}
