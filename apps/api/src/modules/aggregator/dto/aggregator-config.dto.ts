import { IsString, IsBoolean, IsOptional, IsEnum, IsUUID } from 'class-validator';

export enum AggregatorPlatformEnum {
  SWIGGY = 'SWIGGY',
  ZOMATO = 'ZOMATO',
}

export class ConfigureAggregatorDto {
  @IsUUID()
  outletId!: string;

  @IsEnum(AggregatorPlatformEnum)
  platform!: AggregatorPlatformEnum;

  @IsString()
  apiKey!: string;

  @IsString()
  apiSecret!: string;

  @IsString()
  restaurantId!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  autoAccept?: boolean;

  @IsOptional()
  @IsString()
  webhookSecret?: string;
}

export class UpdateAggregatorStatusDto {
  @IsUUID()
  orderId!: string;

  @IsString()
  status!: string;

  @IsEnum(AggregatorPlatformEnum)
  platform!: AggregatorPlatformEnum;

  @IsString()
  platformOrderId!: string;
}
