import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StocksService } from './stocks.service';

@Controller('stocks')
@UseGuards(JwtAuthGuard)
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get(':symbol/detail')
  getDetail(@Param('symbol') symbol: string) {
    return this.stocksService.getStockDetail(symbol);
  }

  @Get(':symbol/chart')
  getChart(@Param('symbol') symbol: string) {
    return this.stocksService.getChartData(symbol, 14);
  }

  @Get(':symbol/quote')
  getQuote(@Param('symbol') symbol: string) {
    return this.stocksService.getQuote(symbol);
  }
}
