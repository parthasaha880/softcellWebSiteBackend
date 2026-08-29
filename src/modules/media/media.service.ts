import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../common/dto/pagination.dto";

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { type?: string; folderId?: string }) {
    const { page = 1, limit = 20, search, type, folderId } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where: any = {};
    if (search)
      where.OR = [
        { filename: { contains: search, mode: "insensitive" } },
        { originalName: { contains: search, mode: "insensitive" } },
        { altText: { contains: search, mode: "insensitive" } },
      ];
    if (type) where.type = type;
    if (folderId) where.folderId = folderId;
    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { folder: { select: { id: true, name: true } } },
      }),
      this.prisma.media.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async create(data: any, userId?: string) {
    return this.prisma.media.create({
      data: { ...data, uploadedById: userId },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.media.update({ where: { id }, data });
  }
  async remove(id: string) {
    await this.prisma.media.delete({ where: { id } });
    return { message: "Media deleted" };
  }

  // Folders
  async findFolders(parentId?: string) {
    return this.prisma.mediaFolder.findMany({
      where: { parentId: parentId || null },
      include: { _count: { select: { media: true, children: true } } },
    });
  }
  async createFolder(data: any) {
    return this.prisma.mediaFolder.create({ data });
  }
  async deleteFolder(id: string) {
    await this.prisma.mediaFolder.delete({ where: { id } });
    return { message: "Folder deleted" };
  }
}
