import { Module } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { SuggestionsController } from './suggestions.controller';
import { StocksModule } from '../stocks/stocks.module';
import { NewsModule } from '../news/news.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [StocksModule, NewsModule, AiModule],
  controllers: [SuggestionsController],
  providers: [SuggestionsService],
})
export class SuggestionsModule {}
