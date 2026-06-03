import { IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class CreatePortfolioDto {
  @IsString()
  stockSymbol: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @Min(0)
  buyPrice: number;
}
