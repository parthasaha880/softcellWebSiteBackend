import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base/base-crud.service';

@Injectable()
export class TeamService extends BaseCrudService {
  protected readonly modelName = 'teamMember';
  protected readonly searchFields = ["name","position","department"];
  constructor(prisma: PrismaService) { super(prisma); }

  async findPublished() { return this.model.findMany({ where: { status: 'PUBLISHED' }, orderBy: { order: 'asc' } }); }
  async findLeadership() { return this.model.findMany({ where: { status: 'PUBLISHED', isLeadership: true }, orderBy: { order: 'asc' } }); }
}
