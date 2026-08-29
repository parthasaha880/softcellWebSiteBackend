import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../common/dto/pagination.dto";

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    query: PaginationDto & {
      userId?: string;
      entity?: string;
      action?: string;
    },
  ) {
    const { page = 1, limit = 50, search, userId, entity, action } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where: any = {};
    if (search)
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { entity: { contains: search, mode: "insensitive" } },
      ];
    if (userId) where.userId = userId;
    if (entity) where.entity = entity;
    if (action) where.action = { contains: action, mode: "insensitive" };
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async log(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({ data: data as any });
  }
}
