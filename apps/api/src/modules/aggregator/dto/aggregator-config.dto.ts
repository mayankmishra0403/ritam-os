import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export enum AggregatorPlatformEnum {
  SWIGGY = 'SWIGGY',
  ZOMATO = 'ZOMATO',
}

export class ConfigureAggregatorDto {
  @IsString()
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
  @IsString()
  orderId!: string;

  @IsString()
  status!: string;

  @IsEnum(AggregatorPlatformEnum)
  platform!: AggregatorPlatformEnum;

  @IsString()
  platformOrderId!: string;
}
