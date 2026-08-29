import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base/base-crud.service';

@Injectable()
export class ProductsService extends BaseCrudService {
  protected readonly modelName = 'product';
  protected readonly searchFields = ['name', 'description'];
  constructor(prisma: PrismaService) { super(prisma); }

  async findPublished() {
    return this.model.findMany({ where: { status: 'PUBLISHED' }, orderBy: { order: 'asc' } });
  }
  async findBySlugPublic(slug: string) { return this.findBySlug(slug); }
}
