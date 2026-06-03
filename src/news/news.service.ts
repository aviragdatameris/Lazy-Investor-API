import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(private readonly config: ConfigService) {}

  async getNewsBySymbol(symbol: string, limit = 5): Promise<NewsArticle[]> {
    const apiKey = this.config.get<string>('NEWS_API_KEY');
    if (!apiKey) {
      return this.getMockNews(symbol, limit);
    }

    try {
      const { data } = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: `${symbol} stock India`,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: limit,
          apiKey,
        },
        timeout: 10000,
      });

      const articles: NewsArticle[] = (data.articles ?? [])
        .slice(0, limit)
        .map((a: {
          title?: string;
          description?: string;
          url?: string;
          publishedAt?: string;
          source?: { name?: string };
        }) => ({
          title: a.title ?? '',
          description: a.description ?? '',
          url: a.url ?? '',
          publishedAt: a.publishedAt ?? '',
          source: a.source?.name ?? 'Unknown',
        }));

      if (articles.length > 0) {
        return articles;
      }
      return this.getMockNews(symbol, limit);
    } catch (error) {
      this.logger.error(`NewsAPI error for ${symbol}`, error);
      return this.getMockNews(symbol, limit);
    }
  }

  private getMockNews(symbol: string, limit: number): NewsArticle[] {
    const now = new Date().toISOString();
    const templates = [
      `${symbol} reports quarterly earnings update`,
      `Market analysts discuss ${symbol} sector outlook`,
      `${symbol} mentioned in broader Indian equity trends`,
      `Investors watch ${symbol} amid market volatility`,
      `Industry news impacting ${symbol} performance`,
    ];
    return templates.slice(0, limit).map((title, i) => ({
      title,
      description: `Sample headline for ${symbol} (configure NEWS_API_KEY for live news).`,
      url: 'https://example.com',
      publishedAt: now,
      source: 'Demo',
    }));
  }
}
