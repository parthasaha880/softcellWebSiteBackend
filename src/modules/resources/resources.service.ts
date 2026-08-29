import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async findPublished(params?: {
    type?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { status: "PUBLISHED" };
    if (params?.type) where.type = params.type;
    if (params?.category) where.category = params.category;
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 20);
    const [data, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.resource.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlugPublic(slug: string) {
    const resource = await this.prisma.resource.findUnique({ where: { slug } });
    if (!resource || resource.status !== "PUBLISHED")
      throw new NotFoundException("Resource not found");
    return resource;
  }

  async trackDownload(slug: string) {
    const resource = await this.prisma.resource.findUnique({ where: { slug } });
    if (!resource) throw new NotFoundException("Resource not found");
    await this.prisma.resource.update({
      where: { slug },
      data: { downloadCount: { increment: 1 } },
    });
    return { success: true };
  }

  async getTypes() {
    const types = await this.prisma.resource.findMany({
      where: { status: "PUBLISHED" },
      select: { type: true },
      distinct: ["type"],
    });
    return types.map((t) => t.type);
  }

  async getCategories() {
    const cats = await this.prisma.resource.findMany({
      where: { status: "PUBLISHED", category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    });
    return cats.map((c) => c.category).filter(Boolean);
  }

  // Admin
  async findAll(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }) {
    const where: any = {};
    if (params?.type) where.type = params.type;
    if (params?.status) where.status = params.status;
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 20);
    const [data, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.resource.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) throw new NotFoundException("Resource not found");
    return resource;
  }

  async create(data: any) {
    return this.prisma.resource.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.resource.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.resource.delete({ where: { id } });
  }
}
