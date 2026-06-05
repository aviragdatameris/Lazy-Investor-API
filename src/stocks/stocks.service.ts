import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StockCategory } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { PREDEFINED_STOCKS } from '../common/constants/stocks.constant';
import { NewsService, NewsArticle } from '../news/news.service';
import { AiService } from '../ai/ai.service';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: string;
}

export interface ChartPoint {
  date: string;
  value: number;
}

export interface StockDetail {
  symbol: string;
  name: string;
  quote: StockQuote;
  chart: ChartPoint[];
  news: NewsArticle[];
  aiInsight: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
}

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly newsService: NewsService,
    private readonly aiService: AiService,
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

  getStockName(symbol: string): string {
    for (const stocks of Object.values(PREDEFINED_STOCKS)) {
      const found = stocks.find((s) => s.symbol === symbol.toUpperCase());
      if (found) return found.name;
    }
    const cached = symbol.toUpperCase();
    return cached;
  }

  async getLatestPrice(symbol: string): Promise<number> {
    const quote = await this.getQuote(symbol);
    return quote.price;
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    const sym = symbol.toUpperCase();
    const apiKey = this.config.get<string>('ALPHA_VANTAGE_API_KEY');

    if (apiKey) {
      try {
        const { data } = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: `${sym}.BSE`,
            apikey: apiKey,
          },
          timeout: 10000,
        });
        const q = data?.['Global Quote'];
        const price = parseFloat(q?.['05. price']);
        if (!isNaN(price) && price > 0) {
          const change = parseFloat(q?.['09. change'] ?? '0');
          const changePercent = parseFloat(
            (q?.['10. change percent'] ?? '0').replace('%', ''),
          );
          return {
            symbol: sym,
            price,
            change: isNaN(change) ? 0 : change,
            changePercent: isNaN(changePercent) ? 0 : changePercent,
            high: parseFloat(q?.['03. high'] ?? String(price)) || price,
            low: parseFloat(q?.['04. low'] ?? String(price)) || price,
            volume: q?.['06. volume'] ?? '—',
          };
        }
      } catch (error) {
        this.logger.warn(`Quote API failed for ${sym}`, error);
      }
    }

    return this.getMockQuote(sym);
  }

  async getChartData(symbol: string, days = 14): Promise<ChartPoint[]> {
    const sym = symbol.toUpperCase();
    const apiKey = this.config.get<string>('ALPHA_VANTAGE_API_KEY');

    if (apiKey) {
      try {
        const { data } = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'TIME_SERIES_DAILY',
            symbol: `${sym}.BSE`,
            outputsize: 'compact',
            apikey: apiKey,
          },
          timeout: 12000,
        });
        const series = data?.['Time Series (Daily)'];
        if (series) {
          const points = Object.entries(series)
            .slice(0, days)
            .map(([date, row]) => ({
              date,
              value: parseFloat((row as Record<string, string>)['4. close']),
            }))
            .filter((p) => !isNaN(p.value))
            .reverse();
          if (points.length > 0) return points;
        }
      } catch (error) {
        this.logger.warn(`Chart API failed for ${sym}`, error);
      }
    }

    return this.getMockChart(sym, days);
  }

  async getStockDetail(symbol: string): Promise<StockDetail> {
    const sym = symbol.toUpperCase();
    const [quote, chart, news] = await Promise.all([
      this.getQuote(sym),
      this.getChartData(sym, 14),
      this.newsService.getNewsBySymbol(sym, 5),
    ]);
    const sentiment = this.getSentimentFromNews(news);
    const aiInsight = await this.aiService.generateStockInsight(sym, news);

    return {
      symbol: sym,
      name: this.getStockName(sym),
      quote,
      chart,
      news,
      aiInsight,
      sentiment,
    };
  }

  getSentimentFromNews(
    news: NewsArticle[],
  ): 'Positive' | 'Negative' | 'Neutral' {
    const text = news.map((n) => `${n.title} ${n.description}`).join(' ').toLowerCase();
    const positive = ['gain', 'rise', 'profit', 'growth', 'bull', 'up', 'record', 'strong'];
    const negative = ['fall', 'loss', 'drop', 'decline', 'bear', 'down', 'weak', 'crash'];
    let score = 0;
    positive.forEach((w) => {
      if (text.includes(w)) score += 1;
    });
    negative.forEach((w) => {
      if (text.includes(w)) score -= 1;
    });
    if (score > 0) return 'Positive';
    if (score < 0) return 'Negative';
    return 'Neutral';
  }

  getQuickPreview(
    news: NewsArticle[],
    sentiment: 'Positive' | 'Negative' | 'Neutral',
  ): string {
    const headline = news[0]?.title;
    if (headline && headline.length > 60) {
      return `${sentiment} · ${headline.slice(0, 57)}...`;
    }
    if (headline) return `${sentiment} · ${headline}`;
    return `${sentiment} · Tap for full AI analysis`;
  }

  private getMockQuote(symbol: string): StockQuote {
    const price = this.getMockPrice(symbol);
    const change = price * (Math.random() * 0.04 - 0.02);
    const changePercent = (change / price) * 100;
    return {
      symbol,
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      high: Math.round(price * 1.02 * 100) / 100,
      low: Math.round(price * 0.98 * 100) / 100,
      volume: '—',
    };
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

  private getMockChart(symbol: string, days: number): ChartPoint[] {
    const base = this.getMockPrice(symbol);
    const points: ChartPoint[] = [];
    let value = base * 0.96;
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      value = value * (1 + (Math.random() - 0.48) * 0.025);
      points.push({
        date: d.toISOString().slice(0, 10),
        value: Math.round(value * 100) / 100,
      });
    }
    return points;
  }

  getStocksByCategory(category: StockCategory) {
    return PREDEFINED_STOCKS[category];
  }
}
