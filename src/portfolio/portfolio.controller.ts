import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpsertCashDto } from './dto/upsert-cash.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post('portfolio')
  addPortfolio(@Request() req: { user: { id: string } }, @Body() dto: CreatePortfolioDto) {
    return this.portfolioService.addHolding(req.user.id, dto);
  }

  @Get('portfolio')
  getPortfolio(@Request() req: { user: { id: string } }) {
    return this.portfolioService.getPortfolioSummary(req.user.id);
  }

  @Post('cash')
  upsertCash(@Request() req: { user: { id: string } }, @Body() dto: UpsertCashDto) {
    return this.portfolioService.upsertCash(req.user.id, dto.amount);
  }

  @Get('cash')
  getCash(@Request() req: { user: { id: string } }) {
    return this.portfolioService.getCash(req.user.id);
  }
}
