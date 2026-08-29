import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base/base-crud.service';

@Injectable()
export class ServicesService extends BaseCrudService {
  protected readonly modelName = 'service';
  protected readonly searchFields = ['name', 'description'];

  constructor(prisma: PrismaService) { super(prisma); }

  async findPublished() {
    return this.model.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { order: 'asc' },
      include: { caseStudies: { where: { status: 'PUBLISHED' }, take: 3 } },
    });
  }

  async findBySlugPublic(slug: string) {
    return this.findBySlug(slug, {
      caseStudies: { where: { status: 'PUBLISHED' } },
    });
  }
}
