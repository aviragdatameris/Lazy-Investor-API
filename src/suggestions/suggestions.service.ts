import { Injectable } from '@nestjs/common';
import { RiskLevel, StockCategory } from '@prisma/client';
import {
  ALLOCATION_BY_RISK,
  PREDEFINED_STOCKS,
} from '../common/constants/stocks.constant';
import { StocksService } from '../stocks/stocks.service';
import { NewsService } from '../news/news.service';

export interface StockSuggestionItem {
  stock: string;
  name: string;
  category: StockCategory;
  suggestedInvestment: number;
  quantity: number;
  price: number;
  changePercent: number;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  preview: string;
}

export interface SuggestionResponse {
  amount: number;
  risk: RiskLevel;
  allocation: Record<StockCategory, number>;
  allocationAmounts: Record<StockCategory, number>;
  disclaimer: string;
  suggestions: StockSuggestionItem[];
}

@Injectable()
export class SuggestionsService {
  constructor(
    private readonly stocksService: StocksService,
    private readonly newsService: NewsService,
  ) {}

  async generateSuggestions(
    amount: number,
    risk: RiskLevel,
  ): Promise<SuggestionResponse> {
    const allocation = ALLOCATION_BY_RISK[risk] ?? ALLOCATION_BY_RISK.moderate;
    const allocationAmounts = {
      large: amount * allocation.large,
      mid: amount * allocation.mid,
      small: amount * allocation.small,
    };

    const suggestions: StockSuggestionItem[] = [];

    for (const category of ['large', 'mid', 'small'] as StockCategory[]) {
      const stocks = PREDEFINED_STOCKS[category];
      const categoryBudget = allocationAmounts[category];
      const perStockBudget = categoryBudget / stocks.length;

      for (const stock of stocks) {
        const quote = await this.stocksService.getQuote(stock.symbol);
        const quantity = Math.floor(perStockBudget / quote.price);
        const suggestedInvestment = quantity * quote.price;
        const news = await this.newsService.getNewsBySymbol(stock.symbol, 3);
        const sentiment = this.stocksService.getSentimentFromNews(news);
        const preview = this.stocksService.getQuickPreview(news, sentiment);

        suggestions.push({
          stock: stock.symbol,
          name: stock.name,
          category,
          suggestedInvestment,
          quantity,
          price: quote.price,
          changePercent: quote.changePercent,
          sentiment,
          preview,
        });
      }
    }

    return {
      amount,
      risk,
      allocation,
      allocationAmounts,
      disclaimer:
        'These are educational suggestions only, not financial advice. Tap a stock for full analysis.',
      suggestions,
    };
  }
}
