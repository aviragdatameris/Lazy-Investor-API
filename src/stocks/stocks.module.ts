import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { NewsModule } from '../news/news.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [NewsModule, AiModule],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
