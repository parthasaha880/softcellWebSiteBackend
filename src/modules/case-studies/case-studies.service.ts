import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base/base-crud.service';

@Injectable()
export class CaseStudiesService extends BaseCrudService {
  protected readonly modelName = 'caseStudy';
  protected readonly searchFields = ['title', 'clientName', 'industry'];
  constructor(prisma: PrismaService) { super(prisma); }

  async findPublished(query: any = {}) {
    const { page: _p = 1, limit: _l = 20, industry, technology, search } = query;
    const page = Number(_p); const limit = Number(_l);
    const skip = (page - 1) * limit;
    const where: any = { status: 'PUBLISHED' };
    if (industry) where.industry = industry;
    if (technology) where.technologies = { has: technology };
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { clientName: { contains: search, mode: 'insensitive' } }];
    const [data, total] = await Promise.all([
      this.model.findMany({ where, skip, take: limit, orderBy: { order: 'asc' }, include: { service: { select: { id: true, name: true, slug: true } } } }),
      this.model.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findBySlugPublic(slug: string) {
    return this.findBySlug(slug, { service: { select: { id: true, name: true, slug: true } }, author: { select: { id: true, name: true } } });
  }

  async findIndustries() {
    const items = await this.model.findMany({ where: { status: 'PUBLISHED' }, select: { industry: true }, distinct: ['industry'] });
    return items.map((i: any) => i.industry).filter(Boolean);
  }
}
