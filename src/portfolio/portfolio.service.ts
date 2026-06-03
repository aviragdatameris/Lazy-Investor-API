import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { StocksService } from '../stocks/stocks.service';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stocksService: StocksService,
  ) {}

  addHolding(userId: string, dto: CreatePortfolioDto) {
    return this.prisma.portfolio.create({
      data: {
        userId,
        stockSymbol: dto.stockSymbol.toUpperCase(),
        quantity: dto.quantity,
        buyPrice: dto.buyPrice,
      },
    });
  }

  getHoldings(userId: string) {
    return this.prisma.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPortfolioSummary(userId: string) {
    const [holdings, cashRecord] = await Promise.all([
      this.getHoldings(userId),
      this.prisma.cash.findUnique({ where: { userId } }),
    ]);

    const cash = cashRecord?.amount ?? 0;
    let investedValue = 0;
    let currentValue = 0;

    const enriched = await Promise.all(
      holdings.map(async (h) => {
        const price = await this.stocksService.getLatestPrice(h.stockSymbol);
        const current = price * h.quantity;
        const invested = h.buyPrice * h.quantity;
        investedValue += invested;
        currentValue += current;
        return {
          ...h,
          currentPrice: price,
          investedValue: invested,
          currentValue: current,
          profitLoss: current - invested,
        };
      }),
    );

    return {
      holdings: enriched,
      cash,
      investedValue,
      currentValue,
      totalValue: currentValue + cash,
      profitLoss: currentValue - investedValue,
    };
  }

  upsertCash(userId: string, amount: number) {
    return this.prisma.cash.upsert({
      where: { userId },
      create: { userId, amount },
      update: { amount },
    });
  }

  getCash(userId: string) {
    return this.prisma.cash.findUnique({ where: { userId } });
  }
}
