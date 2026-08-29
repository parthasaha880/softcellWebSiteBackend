import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base/base-crud.service';

@Injectable()
export class FaqService extends BaseCrudService {
  protected readonly modelName = 'faqItem';
  protected readonly searchFields = ["question","answer"];
  constructor(prisma: PrismaService) { super(prisma); }

  async findPublished(category?: string) { const where: any = { status: 'PUBLISHED' }; if (category) where.category = category; return this.model.findMany({ where, orderBy: { order: 'asc' } }); }
  async getCategories() { const items = await this.model.findMany({ where: { status: 'PUBLISHED' }, select: { category: true }, distinct: ['category'] }); return items.map((i: any) => i.category).filter(Boolean); }
}
