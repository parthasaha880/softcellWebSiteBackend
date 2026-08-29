import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base/base-crud.service';

@Injectable()
export class CampaignsService extends BaseCrudService {
  protected readonly modelName = 'campaign';
  protected readonly searchFields = ["name"];
  constructor(prisma: PrismaService) { super(prisma); }

}
