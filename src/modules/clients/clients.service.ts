import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base/base-crud.service';

@Injectable()
export class ClientsService extends BaseCrudService {
  protected readonly modelName = 'client';
  protected readonly searchFields = ["name","industry"];
  constructor(prisma: PrismaService) { super(prisma); }

  async findPublished() { return this.model.findMany({ where: { status: 'PUBLISHED' }, orderBy: { order: 'asc' } }); }
  async findFeatured() { return this.model.findMany({ where: { status: 'PUBLISHED', isFeatured: true }, orderBy: { order: 'asc' } }); }
}
