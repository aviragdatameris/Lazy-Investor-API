import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { NewsArticle } from '../news/news.service';

const GROQ_PROMPT_TEMPLATE = `You are a financial assistant. Analyze the following news headlines for the stock {{stock}}.

{{news}}

Provide:

1. Overall sentiment (Positive, Negative, Neutral)
2. Key reasons in bullet points
3. Short explanation (max 3 lines)
4. Risk level (Low, Medium, High)

Do NOT give buy/sell advice. Only explain.`;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  async generateStockInsight(
    stock: string,
    newsList: NewsArticle[],
  ): Promise<string> {
    const newsText = newsList
      .map((n, i) => `${i + 1}. ${n.title}`)
      .join('\n');

    const prompt = GROQ_PROMPT_TEMPLATE.replace('{{stock}}', stock).replace(
      '{{news}}',
      newsText || 'No recent headlines available.',
    );

    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      return this.getMockInsight(stock);
    }

    try {
      const { data } = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: this.config.get('GROQ_MODEL') ?? 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.4,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      return (
        data.choices?.[0]?.message?.content?.trim() ??
        this.getMockInsight(stock)
      );
    } catch (error) {
      this.logger.error(`Groq API error for ${stock}`, error);
      return this.getMockInsight(stock);
    }
  }

  private getMockInsight(stock: string): string {
    return `1. Overall sentiment: Neutral
2. Key reasons:
   - Limited live news data (configure GROQ_API_KEY)
   - General market conditions apply to ${stock}
3. This is an educational explanation only, not financial advice.
4. Risk level: Medium`;
  }
}
