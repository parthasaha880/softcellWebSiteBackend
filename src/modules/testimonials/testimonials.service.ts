import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base/base-crud.service';

@Injectable()
export class TestimonialsService extends BaseCrudService {
  protected readonly modelName = 'testimonial';
  protected readonly searchFields = ["clientName","company"];
  constructor(prisma: PrismaService) { super(prisma); }

  async findPublished(industry?: string) { const where: any = { status: 'PUBLISHED' }; if (industry) where.industry = industry; return this.model.findMany({ where, orderBy: { order: 'asc' } }); }
  async findFeatured() { return this.model.findMany({ where: { status: 'PUBLISHED', isFeatured: true }, orderBy: { order: 'asc' } }); }
}
