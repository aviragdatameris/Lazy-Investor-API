import { IsNumber, Min } from 'class-validator';

export class UpsertCashDto {
  @IsNumber()
  @Min(0)
  amount: number;
}
