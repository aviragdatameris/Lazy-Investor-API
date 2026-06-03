import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { RiskLevel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuggestionsService } from './suggestions.service';
import { GetSuggestionsDto } from './dto/get-suggestions.dto';

@Controller('suggestions')
@UseGuards(JwtAuthGuard)
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Get()
  getSuggestions(
    @Request() req: { user: { id: string; riskLevel: RiskLevel } },
    @Query() query: GetSuggestionsDto,
  ) {
    const risk = query.risk ?? req.user.riskLevel ?? RiskLevel.moderate;
    return this.suggestionsService.generateSuggestions(query.amount, risk);
  }
}
