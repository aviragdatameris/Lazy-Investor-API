import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { RiskLevel } from '@prisma/client';
import { Type } from 'class-transformer';

export class GetSuggestionsDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  amount: number;

  @IsOptional()
  @IsEnum(RiskLevel)
  risk?: RiskLevel;
}
