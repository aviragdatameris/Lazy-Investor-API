import { Module } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { SuggestionsController } from './suggestions.controller';
import { StocksModule } from '../stocks/stocks.module';
import { NewsModule } from '../news/news.module';

@Module({
  imports: [StocksModule, NewsModule],
  controllers: [SuggestionsController],
  providers: [SuggestionsService],
})
export class SuggestionsModule {}
