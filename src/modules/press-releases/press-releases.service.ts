import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PressReleasesService {
  constructor(private prisma: PrismaService) {}

  async findPublished(params?: { page?: number; limit?: number }) {
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 20);
    const where = { status: "PUBLISHED" as const };
    const [data, total] = await Promise.all([
      this.prisma.pressRelease.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.pressRelease.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlugPublic(slug: string) {
    const pr = await this.prisma.pressRelease.findUnique({ where: { slug } });
    if (!pr || pr.status !== "PUBLISHED")
      throw new NotFoundException("Press release not found");
    return pr;
  }

  // Admin
  async findAll(params?: { page?: number; limit?: number; status?: string }) {
    const where: any = {};
    if (params?.status) where.status = params.status;
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 20);
    const [data, total] = await Promise.all([
      this.prisma.pressRelease.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.pressRelease.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const pr = await this.prisma.pressRelease.findUnique({ where: { id } });
    if (!pr) throw new NotFoundException("Press release not found");
    return pr;
  }

  async create(data: any) {
    return this.prisma.pressRelease.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.pressRelease.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.pressRelease.delete({ where: { id } });
  }
}
