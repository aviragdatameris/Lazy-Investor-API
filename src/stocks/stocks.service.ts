import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StockCategory } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import {
  PREDEFINED_STOCKS,
} from '../common/constants/stocks.constant';

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async seedPredefinedStocks() {
    for (const [category, stocks] of Object.entries(PREDEFINED_STOCKS)) {
      for (const stock of stocks) {
        await this.prisma.stock.upsert({
          where: { symbol: stock.symbol },
          create: {
            symbol: stock.symbol,
            name: stock.name,
            category: category as StockCategory,
          },
          update: { name: stock.name, category: category as StockCategory },
        });
      }
    }
  }

  async getLatestPrice(symbol: string): Promise<number> {
    const apiKey = this.config.get<string>('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      return this.getMockPrice(symbol);
    }

    try {
      const avSymbol = `${symbol}.BSE`;
      const { data } = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: avSymbol,
          apikey: apiKey,
        },
        timeout: 10000,
      });

      const quote = data?.['Global Quote'];
      const price = parseFloat(quote?.['05. price']);
      if (!isNaN(price) && price > 0) {
        return price;
      }
      this.logger.warn(`No price for ${symbol}, using fallback`);
      return this.getMockPrice(symbol);
    } catch (error) {
      this.logger.error(`Alpha Vantage error for ${symbol}`, error);
      return this.getMockPrice(symbol);
    }
  }

  private getMockPrice(symbol: string): number {
    const mockPrices: Record<string, number> = {
      RELIANCE: 2850,
      TCS: 4100,
      DIXON: 12500,
      DEEPAKNTR: 2450,
      IDEA: 12,
      SUZLON: 55,
    };
    return mockPrices[symbol.toUpperCase()] ?? 100;
  }

  getStocksByCategory(category: StockCategory) {
    return PREDEFINED_STOCKS[category];
  }
}
