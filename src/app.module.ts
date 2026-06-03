import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { StocksModule } from './stocks/stocks.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { NewsModule } from './news/news.module';
import { AiModule } from './ai/ai.module';
import { StocksService } from './stocks/stocks.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PortfolioModule,
    StocksModule,
    SuggestionsModule,
    NewsModule,
    AiModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly stocksService: StocksService) {}

  async onModuleInit() {
    await this.stocksService.seedPredefinedStocks();
  }
}
