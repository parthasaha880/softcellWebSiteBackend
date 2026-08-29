import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../dto/pagination.dto';

export abstract class BaseCrudService<TCreate = any, TUpdate = any> {
  protected abstract readonly modelName: string;
  protected abstract readonly searchFields: string[];

  constructor(protected readonly prisma: PrismaService) {}

  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  async findAll(query: PaginationDto & Record<string, any>, extraWhere: any = {}, include?: any) {
    const { page: _p = 1, limit: _l = 20, search, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = query;
    const page = Number(_p);
    const limit = Number(_l);
    const skip = (page - 1) * limit;
    const where: any = { ...extraWhere };

    if (search && this.searchFields.length) {
      where.OR = this.searchFields.map((f) => ({ [f]: { contains: search, mode: 'insensitive' } }));
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && !['page', 'limit', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        where[key] = value;
      }
    });

    const [data, total] = await Promise.all([
      this.model.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder }, ...(include ? { include } : {}) }),
      this.model.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: string, include?: any) {
    const item = await this.model.findUnique({ where: { id }, ...(include ? { include } : {}) });
    if (!item) throw new NotFoundException(`${this.modelName} not found`);
    return item;
  }

  async findBySlug(slug: string, include?: any) {
    const item = await this.model.findUnique({ where: { slug }, ...(include ? { include } : {}) });
    if (!item) throw new NotFoundException(`${this.modelName} not found`);
    return item;
  }

  async create(data: TCreate) {
    return this.model.create({ data });
  }

  async update(id: string, data: TUpdate) {
    await this.findOne(id);
    return this.model.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.model.delete({ where: { id } });
    return { message: `${this.modelName} deleted successfully` };
  }
}
