import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base/base-crud.service';

@Injectable()
export class SnippetsService extends BaseCrudService {
  protected readonly modelName = 'contentSnippet';
  protected readonly searchFields = ['key', 'title'];
  constructor(prisma: PrismaService) { super(prisma); }

  async findByKey(key: string) { return this.model.findUnique({ where: { key } }); }
  async findAllPublic() { return this.model.findMany({ orderBy: { key: 'asc' } }); }
}
