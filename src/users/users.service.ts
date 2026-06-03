import { Injectable } from '@nestjs/common';
import { Prisma, RiskLevel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    name: string;
    email: string;
    password: string;
    riskLevel?: RiskLevel;
  }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        riskLevel: data.riskLevel ?? RiskLevel.moderate,
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  updateRiskLevel(userId: string, riskLevel: RiskLevel) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { riskLevel },
    });
  }
}
