import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NewsService } from './news.service';

@Controller('news')
@UseGuards(JwtAuthGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  getNews(@Query('symbol') symbol: string) {
    return this.newsService.getNewsBySymbol(symbol?.toUpperCase() ?? 'TCS');
  }
}
